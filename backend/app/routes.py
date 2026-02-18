from fastapi import APIRouter
from typing import List
from app.models import Protocol, RebalanceEvent
from app.ai_agent import AIAgent

router = APIRouter()

# Shared AI agent instance (will be injected from main)
ai_agent: AIAgent = None

def set_ai_agent(agent: AIAgent):
    global ai_agent
    ai_agent = agent

@router.get("/protocols")
async def get_protocols():
    """Get current protocol APY data"""
    if ai_agent is None:
        return {
            "protocols": [],
            "ai_status": "Not initialized"
        }
    
    protocols = await ai_agent.protocol_manager.fetch_all_apys()
    
    # Mark current protocol as active
    current = ai_agent.vault_manager.current_protocol
    for p in protocols:
        if p.name == current:
            p.is_active = True
    
    return {
        "protocols": [p.dict() for p in protocols],
        "ai_status": ai_agent.status
    }

@router.get("/vault/status")
async def get_vault_status():
    """Get vault status and balance"""
    if ai_agent is None:
        return {"balance": "0"}
    
    balance = await ai_agent.vault_manager.get_balance()
    return {
        "balance": balance,
        "current_protocol": ai_agent.vault_manager.current_protocol
    }

@router.get("/rebalances")
async def get_rebalances():
    """Get rebalance history"""
    if ai_agent is None:
        return {"rebalances": []}
    
    history = ai_agent.vault_manager.get_rebalance_history()
    return {
        "rebalances": [event.dict() for event in history]
    }

@router.post("/trigger-cycle")
async def trigger_cycle():
    """Manually trigger an AI optimization cycle"""
    if ai_agent is None:
        return {"status": "error", "message": "AI agent not initialized"}
    
    await ai_agent.run_cycle()
    return {
        "status": "success",
        "message": "AI cycle triggered",
        "last_run": ai_agent.last_run
    }
