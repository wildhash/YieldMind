from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class Protocol(BaseModel):
    name: str
    apy: float
    tvl: str
    risk_score: int
    is_active: bool = False

class RebalanceDecision(BaseModel):
    should_rebalance: bool
    target_protocol: str
    delta_percentage: float
    reason: str

class RebalanceEvent(BaseModel):
    timestamp: datetime
    from_protocol: str
    to_protocol: str
    amount: str
    reason: str
    tx_hash: Optional[str] = None


class ProtocolsResponse(BaseModel):
    protocols: List[Protocol]
    ai_status: str


class VaultStatusResponse(BaseModel):
    balance: str
    current_protocol: Optional[str] = None
    agent_initialized: bool = True


class RebalancesResponse(BaseModel):
    rebalances: List[RebalanceEvent]


class TriggerCycleResponse(BaseModel):
    status: Literal["success", "error"]
    message: str
    last_run: Optional[datetime] = None


class BackendRootResponse(BaseModel):
    name: str
    status: str
    ai_model: str
    cycle_interval: str
    cycle_interval_minutes: int
