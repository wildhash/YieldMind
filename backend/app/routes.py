from fastapi import APIRouter
from app.models import (
    ProtocolsResponse,
    VaultStatusResponse,
    RebalancesResponse,
    TriggerCycleResponse,
)
from app.ai_agent import AIAgent

router = APIRouter()

# Shared AI agent instance (will be injected from main)
ai_agent: AIAgent = None

def set_ai_agent(agent: AIAgent):
    global ai_agent
    ai_agent = agent

@router.get("/protocols", response_model=ProtocolsResponse)
async def get_protocols() -> ProtocolsResponse:
    """Get current protocol APY data"""
    if ai_agent is None:
        return ProtocolsResponse(protocols=[], ai_status="Not initialized")
    
    protocols = await ai_agent.protocol_manager.fetch_all_apys()
    
    # Mark current protocol as active
    current = ai_agent.vault_manager.current_protocol
    for p in protocols:
        if p.name == current:
            p.is_active = True
    
    return ProtocolsResponse(protocols=protocols, ai_status=ai_agent.status)

@router.get("/vault/status", response_model=VaultStatusResponse)
async def get_vault_status() -> VaultStatusResponse:
    """Get vault status and balance"""
    if ai_agent is None:
        return VaultStatusResponse(balance="0", current_protocol="")
    
    balance = await ai_agent.vault_manager.get_balance()
    return VaultStatusResponse(balance=balance, current_protocol=ai_agent.vault_manager.current_protocol)

@router.get("/rebalances", response_model=RebalancesResponse)
async def get_rebalances() -> RebalancesResponse:
    """Get rebalance history"""
    if ai_agent is None:
        return RebalancesResponse(rebalances=[])
    
    history = ai_agent.vault_manager.get_rebalance_history()
    return RebalancesResponse(rebalances=history)

@router.post("/trigger-cycle", response_model=TriggerCycleResponse)
async def trigger_cycle() -> TriggerCycleResponse:
    """Manually trigger an AI optimization cycle"""
    if ai_agent is None:
        return TriggerCycleResponse(status="error", message="AI agent not initialized")
    
    await ai_agent.run_cycle()
    return TriggerCycleResponse(status="success", message="AI cycle triggered", last_run=ai_agent.last_run)
