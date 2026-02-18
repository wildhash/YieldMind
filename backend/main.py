from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import uvicorn
from dotenv import load_dotenv
import os

from app.ai_agent import AIAgent
from app.routes import router, set_ai_agent

load_dotenv()

app = FastAPI(title="YieldMind AI Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Agent
ai_agent = AIAgent()
set_ai_agent(ai_agent)

# Setup scheduler for 5-minute cycles
scheduler = BackgroundScheduler()
scheduler.add_job(ai_agent.run_cycle, 'interval', minutes=5)
scheduler.start()

# Include routes
app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    print("🚀 YieldMind AI Backend started")
    print("🤖 AI Agent initialized with Claude Opus 4.5")
    print("⏱️  Running optimization cycles every 5 minutes")
    # Run initial cycle
    await ai_agent.run_cycle()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/")
async def root():
    return {
        "name": "YieldMind AI Backend",
        "status": "active",
        "ai_model": "claude-opus-4-5",
        "cycle_interval": "5 minutes"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
