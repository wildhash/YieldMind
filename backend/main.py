from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import uvicorn
from dotenv import load_dotenv
import os

from app.ai_agent import AIAgent
from app.routes import router, set_ai_agent
from app.models import BackendRootResponse

load_dotenv()

def _get_int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default

    try:
        return int(raw)
    except ValueError:
        print(f"Invalid {name}={raw!r}; using {default}")
        return default

DEFAULT_CYCLE_INTERVAL_MINUTES = 5
MIN_CYCLE_INTERVAL_MINUTES = 5

raw_cycle_interval = _get_int_env("CYCLE_INTERVAL_MINUTES", DEFAULT_CYCLE_INTERVAL_MINUTES)
if raw_cycle_interval < MIN_CYCLE_INTERVAL_MINUTES:
    print(
        f"CYCLE_INTERVAL_MINUTES={raw_cycle_interval} is too low; using {MIN_CYCLE_INTERVAL_MINUTES}"
    )
    CYCLE_INTERVAL_MINUTES = MIN_CYCLE_INTERVAL_MINUTES
else:
    CYCLE_INTERVAL_MINUTES = raw_cycle_interval

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
scheduler.add_job(ai_agent.run_cycle, 'interval', minutes=CYCLE_INTERVAL_MINUTES)
scheduler.start()

# Include routes
app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    print("🚀 YieldMind AI Backend started")
    print(f"🤖 AI Agent initialized (model: {ai_agent.model})")
    print(f"⏱️  Running optimization cycles every {CYCLE_INTERVAL_MINUTES} minutes")
    # Run initial cycle
    await ai_agent.run_cycle()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/", response_model=BackendRootResponse)
async def root() -> BackendRootResponse:
    return BackendRootResponse(
        name="YieldMind AI Backend",
        status="active",
        ai_model=ai_agent.model,
        cycle_interval=f"{CYCLE_INTERVAL_MINUTES} minutes",
        cycle_interval_minutes=CYCLE_INTERVAL_MINUTES,
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
