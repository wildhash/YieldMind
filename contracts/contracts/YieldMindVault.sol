// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YieldMindVault
 * @dev AI-optimized yield vault for BNB Chain DeFi protocols
 * Manages deposits and rebalancing across PancakeSwap V3, Venus, and Lista DAO
 */
contract YieldMindVault {
    address public owner;
    address public aiAgent;
    
    // Protocol addresses (IMPORTANT: Replace with actual BSC mainnet addresses before deployment)
    // These are placeholder values for testing only
    address public constant PANCAKESWAP_V3 = address(0x1);
    address public constant VENUS = address(0x2);
    address public constant LISTA_DAO = address(0x3);
    
    // Current active protocol
    address public currentProtocol;
    
    // Vault state
    uint256 public totalDeposits;
    mapping(address => uint256) public userDeposits;
    
    // Rebalance tracking
    struct RebalanceLog {
        uint256 timestamp;
        address fromProtocol;
        address toProtocol;
        uint256 amount;
        string reason;
        uint256 deltaPercentage;
    }
    
    RebalanceLog[] public rebalanceHistory;
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Rebalance(
        address indexed fromProtocol,
        address indexed toProtocol,
        uint256 amount,
        string reason,
        uint256 deltaPercentage
    );
    event AIAgentUpdated(address indexed oldAgent, address indexed newAgent);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI agent");
        _;
    }
    
    constructor(address _aiAgent) {
        owner = msg.sender;
        aiAgent = _aiAgent;
        currentProtocol = PANCAKESWAP_V3;
    }
    
    /**
     * @dev Deposit BNB into the vault
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit BNB");
        
        userDeposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw user's deposits
     */
    function withdraw(uint256 amount) external {
        require(userDeposits[msg.sender] >= amount, "Insufficient balance");
        
        userDeposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        payable(msg.sender).transfer(amount);
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @dev Execute rebalance between protocols
     * Can only be called by the AI agent
     * @param toProtocol Target protocol address
     * @param reason Human-readable reason for rebalance
     * @param deltaPercentage The yield delta that triggered rebalance
     */
    function executeRebalance(
        address toProtocol,
        string calldata reason,
        uint256 deltaPercentage
    ) external onlyAIAgent {
        require(
            toProtocol == PANCAKESWAP_V3 || 
            toProtocol == VENUS || 
            toProtocol == LISTA_DAO,
            "Invalid protocol"
        );
        require(deltaPercentage >= 200, "Delta must be >= 2%"); // 200 basis points = 2%
        require(toProtocol != currentProtocol, "Already in target protocol");
        
        address fromProtocol = currentProtocol;
        uint256 amount = address(this).balance;
        
        // In production, this would:
        // 1. Withdraw from current protocol
        // 2. Deposit into new protocol
        // For now, just update state
        
        currentProtocol = toProtocol;
        
        // Log the rebalance
        rebalanceHistory.push(RebalanceLog({
            timestamp: block.timestamp,
            fromProtocol: fromProtocol,
            toProtocol: toProtocol,
            amount: amount,
            reason: reason,
            deltaPercentage: deltaPercentage
        }));
        
        emit Rebalance(fromProtocol, toProtocol, amount, reason, deltaPercentage);
    }
    
    /**
     * @dev Update AI agent address
     */
    function updateAIAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "Invalid address");
        address oldAgent = aiAgent;
        aiAgent = newAgent;
        emit AIAgentUpdated(oldAgent, newAgent);
    }
    
    /**
     * @dev Get rebalance history count
     */
    function getRebalanceCount() external view returns (uint256) {
        return rebalanceHistory.length;
    }
    
    /**
     * @dev Get specific rebalance log
     */
    function getRebalanceLog(uint256 index) external view returns (
        uint256 timestamp,
        address fromProtocol,
        address toProtocol,
        uint256 amount,
        string memory reason,
        uint256 deltaPercentage
    ) {
        require(index < rebalanceHistory.length, "Index out of bounds");
        RebalanceLog memory log = rebalanceHistory[index];
        return (
            log.timestamp,
            log.fromProtocol,
            log.toProtocol,
            log.amount,
            log.reason,
            log.deltaPercentage
        );
    }
    
    /**
     * @dev Get vault balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency withdraw by owner (safety mechanism)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    receive() external payable {
        // Accept BNB
    }
}
