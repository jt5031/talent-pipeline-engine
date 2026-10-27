# ⚡ TalentPipeline Engine

An automated sourcing, algorithmic candidate evaluation, and outreach orchestration platform built with a modern multi-tier architecture.

## 🏛️ Architecture & Tech Stack

This project uses a decoupled, multi-service architecture:
- **Core Engine (Python / FastAPI):** Handles algorithmic matching, data processing, and scoring logic (Runs on port `8000`).
- **Orchestration Layer (Node.js / Express):** Manages API routing, middleware, and orchestrates requests between the frontend and core engine (Runs on port `5001`).
- **Frontend Dashboard (React / Vite):** Provides an interactive UI for configuring job requisitions, viewing ranked candidate leaderboards, and triggering outreach actions (Runs on port `5173`).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js & npm
- Python (3.8+) & pip

### 1. Start the Python FastAPI Core
```bash
# Navigate to your python backend directory and start the server
cd path/to/fastapi-core
uvicorn main:app --reload --port 8000