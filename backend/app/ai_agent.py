from typing import List, Dict, Any
import os
from datetime import datetime
import anthropic
import json

from app.protocols import ProtocolManager
from app.vault_manager import VaultManager
from app.models import Protocol, RebalanceDecision

class AIAgent:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        self.protocol_manager = ProtocolManager()
        self.vault_manager = VaultManager()
        self.status = "Initializing..."
        self.last_run = None
        
    async def run_cycle(self):
        """Main AI optimization cycle - runs every 5 minutes"""
        try:
            self.status = "Fetching protocol data..."
            print(f"\n{'='*60}")
            print(f"🤖 AI Agent Cycle Started at {datetime.now()}")
            print(f"{'='*60}")
            
            # Fetch APY data from protocols
            protocols = await self.protocol_manager.fetch_all_apys()
            
            self.status = "Analyzing with Claude Opus 4.5..."
            
            # Prepare data for AI analysis
            protocol_data = [
                {
                    "name": p.name,
                    "apy": p.apy,
                    "tvl": p.tvl,
                    "risk_score": p.risk_score
                }
                for p in protocols
            ]
            
            # Get current vault allocation
            current_allocation = await self.vault_manager.get_current_allocation()
            
            # Use Claude to analyze and decide
            decision = await self.analyze_with_claude(protocol_data, current_allocation)
            
            self.status = "Executing rebalance..."
            
            # Execute rebalance if needed
            if decision.should_rebalance:
                await self.execute_rebalance(decision)
                self.status = f"Rebalanced: {decision.reason}"
            else:
                self.status = "Optimal - No rebalance needed"
            
            self.last_run = datetime.now()
            print(f"✅ Cycle completed: {self.status}")
            
        except Exception as e:
            self.status = f"Error: {str(e)}"
            print(f"❌ Error in AI cycle: {e}")
    
    async def analyze_with_claude(
        self, 
        protocols: List[Dict[str, Any]], 
        current_allocation: Dict[str, float]
    ) -> RebalanceDecision:
        """Use Claude Opus 4.5 to analyze protocols and make rebalance decision"""
        
        # Define tools for Claude
        tools = [
            {
                "name": "calculate_risk_adjusted_return",
                "description": "Calculate risk-adjusted return (Sharpe-like metric) for a protocol",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "apy": {"type": "number", "description": "Annual Percentage Yield"},
                        "risk_score": {"type": "number", "description": "Risk score from 1-10"}
                    },
                    "required": ["apy", "risk_score"]
                }
            },
            {
                "name": "recommend_rebalance",
                "description": "Recommend whether to rebalance and to which protocol",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "should_rebalance": {"type": "boolean"},
                        "target_protocol": {"type": "string"},
                        "delta_percentage": {"type": "number"},
                        "reason": {"type": "string"}
                    },
                    "required": ["should_rebalance", "target_protocol", "delta_percentage", "reason"]
                }
            }
        ]
        
        # Create analysis prompt
        prompt = f"""You are an AI DeFi optimizer for YieldMind on BNB Chain.

Current Protocol Data:
{json.dumps(protocols, indent=2)}

Current Vault Allocation:
{json.dumps(current_allocation, indent=2)}

Your task:
1. Calculate risk-adjusted returns for each protocol using the calculate_risk_adjusted_return tool
2. Compare the best risk-adjusted return with the current allocation
3. If the delta is > 2%, recommend a rebalance using the recommend_rebalance tool
4. If delta <= 2%, recommend no rebalance

Consider:
- Higher APY is better but must be balanced with risk
- Risk-adjusted return = APY / (1 + risk_score/10)
- Only rebalance if improvement is > 2% to avoid gas waste
"""

        message = self.client.messages.create(
            model="claude-opus-4-20250514",
            max_tokens=2000,
            tools=tools,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Process tool use
        decision = RebalanceDecision(
            should_rebalance=False,
            target_protocol="",
            delta_percentage=0.0,
            reason="No analysis completed"
        )
        
        for content in message.content:
            if content.type == "tool_use":
                if content.name == "recommend_rebalance":
                    decision = RebalanceDecision(**content.input)
                    print(f"🎯 AI Decision: {decision.reason}")
                    print(f"   Should Rebalance: {decision.should_rebalance}")
                    if decision.should_rebalance:
                        print(f"   Target: {decision.target_protocol}")
                        print(f"   Delta: {decision.delta_percentage:.2f}%")
        
        return decision
    
    async def execute_rebalance(self, decision: RebalanceDecision):
        """Execute the rebalance on-chain"""
        try:
            tx_hash = await self.vault_manager.execute_rebalance(
                target_protocol=decision.target_protocol,
                reason=decision.reason
            )
            print(f"✅ Rebalance executed: {tx_hash}")
        except Exception as e:
            print(f"❌ Rebalance execution failed: {e}")
            raise
