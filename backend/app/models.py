from pydantic import BaseModel
from typing import Optional

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
    timestamp: str
    from_protocol: str
    to_protocol: str
    amount: str
    reason: str
    tx_hash: Optional[str] = None
