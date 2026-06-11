"""
Komuz-AI — HF Spaces inference server
Pipeline: text prompt → MusicGen → RVC (komuz checkpoint) → WAV
"""
import os
import sys
import glob
import shutil
import subprocess
import tempfile
import tarfile
import logging

import numpy as np
import torch
import librosa
import soundfile as sf
import gradio as gr
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
APPLIO_DIR = "/home/user/app/applio"
MODELS_DIR = "/home/user/app/models"
LOG_DIR    = f"{APPLIO_DIR}/logs/komuz"
RMVPE_PATH = f"{APPLIO_DIR}/rvc/models/predictors/rmvpe.pt"


# ── Startup: prepare Applio + model files ────────────────────────────────────
def _setup():
    if not os.path.exists(APPLIO_DIR):
        log.info("Cloning Applio...")
        subprocess.run(
            ["git", "clone", "--depth=1",
             "https://github.com/IAHispano/Applio", APPLIO_DIR],
            check=True,
        )

    applio_req = f"{APPLIO_DIR}/requirements.txt"
    if os.path.exists(applio_req):
        log.info("Installing Applio requirements...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-q", "-r", applio_req],
            check=False,
        )

    os.makedirs(LOG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(RMVPE_PATH), exist_ok=True)

    if not os.path.exists(RMVPE_PATH):
        log.info("Downloading rmvpe.pt...")
        subprocess.run(
            ["wget", "-q", "-O", RMVPE_PATH,
             "https://huggingface.co/IAHispano/Applio/resolve/main/Resources/predictors/rmvpe.pt"],
            check=True,
        )

    for archive in glob.glob(f"{MODELS_DIR}/*.tar.gz") + glob.glob(f"{MODELS_DIR}/*.tgz"):
        log.info("Extracting %s...", os.path.basename(archive))
        with tarfile.open(archive, "r:gz") as tar:
            for member in tar.getmembers():
                if member.name.endswith(".pth") or member.name.endswith(".index"):
                    member.name = os.path.basename(member.name)
                    dest = f"{LOG_DIR}/{member.name}"
                    if not os.path.exists(dest):
                        tar.extract(member, LOG_DIR)
                        log.info("Extracted: %s", member.name)

    for src in glob.glob(f"{MODELS_DIR}/*.pth") + glob.glob(f"{MODELS_DIR}/*.index"):
        dest = f"{LOG_DIR}/{os.path.basename(src)}"
        if not os.path.exists(dest):
            shutil.copy2(src, dest)
            log.info("Copied: %s", os.path.basename(src))

    pth = glob.glob(f"{LOG_DIR}/*.pth")
    if pth:
        log.info("RVC checkpoint ready: %s", os.path.basename(pth[-1]))
    else:
        log.warning("No .pth checkpoint found")


_setup()

# ── MusicGen — lazy load on first request ────────────────────────────────────
from transformers import AutoProcessor, MusicgenForConditionalGeneration

DEVICE   = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE    = torch.float16 if DEVICE == "cuda" else torch.float32
MG_MODEL = "facebook/musicgen-medium"

_mg_model = None
_mg_proc  = None
SR_MG     = 32000


def _load_musicgen():
    global _mg_model, _mg_proc, SR_MG
    if _mg_model is not None:
        return
    log.info("Loading MusicGen (%s) on %s...", MG_MODEL, DEVICE)
    _mg_model = MusicgenForConditionalGeneration.from_pretrained(
        MG_MODEL, torch_dtype=DTYPE,
    ).eval().to(DEVICE)
    _mg_proc = AutoProcessor.from_pretrained(MG_MODEL)
    SR_MG = _mg_model.config.audio_encoder.sampling_rate
    log.info("MusicGen ready (SR=%d)", SR_MG)


# ── Core pipeline ─────────────────────────────────────────────────────────────
def _run_pipeline(prompt: str, duration: int) -> bytes:
    pth_files = sorted(glob.glob(f"{LOG_DIR}/*.pth"))
    idx_files = sorted(glob.glob(f"{LOG_DIR}/*.index"))
    if not pth_files:
        raise RuntimeError("No RVC checkpoint. Upload komuz.pth to models/")

    pth_path = pth_files[-1]
    idx_path = idx_files[-1] if idx_files else ""

    _load_musicgen()
    max_tokens = int(duration * 51.2)
    log.info("MusicGen: %d tokens for %ds", max_tokens, duration)
    inputs = _mg_proc(text=[prompt], return_tensors="pt", padding=True).to(DEVICE)
    with torch.inference_mode():
        out = _mg_model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=True,
            temperature=1.2,
            top_k=250,
            guidance_scale=8.0,
        )

    audio_mg = out[0, 0].cpu().float().numpy()
    audio_mg /= np.abs(audio_mg).max() + 1e-8
    audio_16k = librosa.resample(audio_mg, orig_sr=SR_MG, target_sr=16000)

    tmp_in  = tempfile.mktemp(suffix="_mg.wav")
    tmp_out = tempfile.mktemp(suffix="_komuz.wav")
    try:
        sf.write(tmp_in, audio_16k, 16000)
        os.chdir(APPLIO_DIR)
        r = subprocess.run(
            [
                sys.executable, "core.py", "infer",
                "--input_path",    tmp_in,
                "--output_path",   tmp_out,
                "--pth_path",      pth_path,
                "--index_path",    idx_path,
                "--f0_method",     "rmvpe",
                "--pitch",         "0",
                "--index_rate",    "0.90",
                "--protect",       "0.50",
                "--export_format", "WAV",
            ],
            capture_output=True,
            text=True,
            timeout=180,
        )
        log.info("RVC stdout: %s", r.stdout[-300:] if r.stdout else "")
        if r.stderr:
            log.warning("RVC stderr: %s", r.stderr[-300:])
        if not os.path.exists(tmp_out):
            raise RuntimeError(f"RVC failed (no output file): {r.stderr[-500:]}")
        size = os.path.getsize(tmp_out)
        if size < 1000:
            raise RuntimeError(f"RVC output suspiciously small ({size} bytes): {r.stderr[-300:]}")
        log.info("RVC output: %d bytes", size)
        with open(tmp_out, "rb") as f:
            return f.read()
    finally:
        for p in [tmp_in, tmp_out]:
            if os.path.exists(p):
                os.unlink(p)


# ── Minimal Gradio UI (status page only, no Audio widget to avoid schema bug) ─
pth_ready = glob.glob(f"{LOG_DIR}/*.pth")
with gr.Blocks(title="Komuz-AI") as demo:
    gr.Markdown(f"""
# Komuz-AI Inference Server
**Status:** running
**Device:** {DEVICE}
**Checkpoint:** {os.path.basename(pth_ready[-1]) if pth_ready else "not found"}

---
API: `POST /generate` — `{{"prompt": "...", "duration": 15}}` → `audio/wav`
""")

demo.queue()
app, _, _ = demo.launch(
    server_name="0.0.0.0",
    server_port=7860,
    prevent_thread_lock=True,
    show_error=True,
)


# ── FastAPI routes ─────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 15


@app.get("/health")
def health():
    pth = glob.glob(f"{LOG_DIR}/*.pth")
    return {
        "status": "ok",
        "checkpoint": os.path.basename(pth[-1]) if pth else None,
        "device": DEVICE,
        "model_loaded": _mg_model is not None,
    }


@app.post("/generate")
async def api_generate(req: GenerateRequest):
    try:
        audio = _run_pipeline(req.prompt, req.duration)
        return Response(content=audio, media_type="audio/wav")
    except Exception as exc:
        log.error("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


demo.block_thread()
