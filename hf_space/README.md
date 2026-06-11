---
title: Komuz-AI
emoji: 🎵
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 5.9.1
app_file: app.py
pinned: false
license: mit
---

# Komuz-AI Inference Server

Pipeline: **text prompt → MusicGen → RVC (komuz checkpoint) → WAV**

## Required model files (place in `models/`)

| File | Description |
|------|-------------|
| `komuz.pth` | Trained RVC voice model (from Applio training) |
| `komuz.index` | FAISS index for better timbre matching (optional) |

## API

`POST /generate` — called by the komuz-ai backend

```json
{ "prompt": "slow sad folk melody, minor key", "duration": 15 }
```

Returns: `audio/wav` bytes

`GET /health` — check server status
