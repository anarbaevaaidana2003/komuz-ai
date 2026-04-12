# Komuz-AI

Веб-платформа для генерации музыки на комузе с помощью AI.  
Сохранение и популяризация нематериального культурного наследия Кыргызстана.

## Быстрый старт

### Backend

```bash
cd backend

# 1. Установить зависимости
pip install -r requirements.txt

# 2. Скопировать env-файл
cp .env.example .env
# Отредактировать .env при необходимости

# 3. Запустить сервер (USE_MOCK_AI=true по умолчанию)
uvicorn app.main:app --reload
```

API документация: http://localhost:8000/docs  
Health check: http://localhost:8000/health

### Frontend

```bash
# Требуется Node.js 18+
cd frontend

npm install
npm run dev
```

Откроется: http://localhost:5173

---

## Фазы разработки

| Фаза | USE_MOCK_AI | Описание |
|------|-------------|----------|
| **1 (сейчас)** | `true` | Mock WAV, без реальной AI |
| **2 (позже)** | `false` | Реальный HF Spaces + checkpoint |

Для переключения: изменить `USE_MOCK_AI` в `backend/.env`.

---

## Стек

- **Frontend:** React + Vite → Vercel
- **Backend:** FastAPI + PostgreSQL → Render.com  
- **Аудио:** Cloudinary (25GB бесплатно)
- **AI:** Hugging Face Spaces (MusicGen + komuz checkpoint)
- **Auth:** JWT (access 15мин + refresh 7дн)

## Деплой

- Frontend: `vercel --prod` из папки `frontend/`
- Backend: push в main → Render автоматически деплоит по `render.yaml`

## База данных

```bash
# Локально — SQLite (создаётся автоматически при старте)

# Production PostgreSQL — миграции через Alembic:
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```
