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
import io
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
MODELS_DIR = "/home/user/app/models"   # .pth and .index files live here
LOG_DIR    = f"{APPLIO_DIR}/logs/komuz"
RMVPE_PATH = f"{APPLIO_DIR}/rvc/models/predictors/rmvpe.pt"


# ── Startup: prepare Applio ──────────────────────────────────────────────────
def _setup():
    if not os.path.exists(APPLIO_DIR):
        log.info("Cloning Applio...")
        subprocess.run(
            ["git", "clone", "--depth=1",
             "https://github.com/IAHispano/Applio", APPLIO_DIR],
            check=True,
        )

    os.makedirs(LOG_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(RMVPE_PATH), exist_ok=True)

    if not os.path.exists(RMVPE_PATH):
        log.info("Downloading rmvpe.pt (~200 MB)...")
        subprocess.run(
            ["wget", "-q", "-O", RMVPE_PATH,
             "https://huggingface.co/IAHispano/Applio/resolve/main/Resources/predictors/rmvpe.pt"],
            check=True,
        )

    for src in glob.glob(f"{MODELS_DIR}/*.pth") + glob.glob(f"{MODELS_DIR}/*.index"):
        dest = f"{LOG_DIR}/{os.path.basename(src)}"
        if not os.path.exists(dest):
            shutil.copy2(src, dest)
            log.info("Copied model file: %s", os.path.basename(src))

    pth = glob.glob(f"{LOG_DIR}/*.pth")
    if pth:
        log.info("RVC checkpoint ready: %s", os.path.basename(pth[-1]))
    else:
        log.warning("No .pth checkpoint found — upload komuz.pth to models/")


_setup()

# ── Load MusicGen (once, at startup) ────────────────────────────────────────
from transformers import AutoProcessor, MusicgenForConditionalGeneration

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE  = torch.float16 if DEVICE == "cuda" else torch.float32

log.info("Loading MusicGen on %s...", DEVICE)
_mg_model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-medium",
    torch_dtype=DTYPE,
).eval().to(DEVICE)
_mg_proc = AutoProcessor.from_pretrained("facebook/musicgen-medium")
SR_MG = _mg_model.config.audio_encoder.sampling_rate
log.info("MusicGen ready (SR=%d)", SR_MG)


# ── Core pipeline ────────────────────────────────────────────────────────────
def _run_pipeline(prompt: str, duration: int) -> bytes:
    pth_files = sorted(glob.glob(f"{LOG_DIR}/*.pth"))
    idx_files = sorted(glob.glob(f"{LOG_DIR}/*.index"))

    if not pth_files:
        raise RuntimeError("No RVC checkpoint. Upload komuz.pth to models/")

    pth_path = pth_files[-1]
    idx_path = idx_files[-1] if idx_files else ""

    # Step 1 — MusicGen
    # Codec runs at 50 Hz → tokens per second
    max_tokens = int(duration * 51.2)
    log.info("MusicGen: %d tokens for %ds (%r)", max_tokens, duration, prompt)
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

    # Step 2 — Resample to 16 kHz for RVC
    audio_16k = librosa.resample(audio_mg, orig_sr=SR_MG, target_sr=16000)

    # Step 3 — RVC inference via Applio core.py
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
                "--index_rate",    "0.75",
                "--protect",       "0.33",
                "--export_format", "WAV",
            ],
            capture_output=True,
            text=True,
            timeout=180,
        )
        if not os.path.exists(tmp_out):
            raise RuntimeError(f"RVC subprocess failed:\n{r.stderr[-500:]}")

        with open(tmp_out, "rb") as f:
            return f.read()
    finally:
        for p in [tmp_in, tmp_out]:
            if os.path.exists(p):
                os.unlink(p)


# ── FastAPI routes (called by komuz-ai backend) ──────────────────────────────
_api = FastAPI(title="Komuz-AI Inference")


class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 15


@_api.get("/health")
def health():
    pth = glob.glob(f"{LOG_DIR}/*.pth")
    return {"status": "ok", "checkpoint": os.path.basename(pth[-1]) if pth else None}


@_api.post("/generate")
async def generate(req: GenerateRequest):
    try:
        audio_bytes = _run_pipeline(req.prompt, req.duration)
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as exc:
        log.error("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ── Gradio UI (visible in HF Spaces browser) ────────────────────────────────
def _gradio_fn(prompt: str, duration: int):
    audio = _run_pipeline(prompt, int(duration))
    y, sr = sf.read(io.BytesIO(audio))
    return (sr, (y * 32767).astype(np.int16))


_demo = gr.Interface(
    fn=_gradio_fn,
    inputs=[
        gr.Textbox(
            label="Описание мелодии",
            placeholder="slow sad folk melody, minor key, 50 BPM",
        ),
        gr.Slider(5, 60, value=15, step=5, label="Длительность (сек)"),
    ],
    outputs=gr.Audio(label="Комуз"),
    title="Komuz-AI",
    description="MusicGen → RVC: генерация мелодии комуза из текстового описания",
)

app = gr.mount_gradio_app(_api, _demo, path="/ui")
