// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TraderRegistry
 * @notice On-chain registry for verified Baseline traders
 * @dev Stores trader profiles, stats, and copy trading eligibility
 */
contract TraderRegistry is Ownable {
    struct Trader {
        bool registered;
        uint256 reputation;
        uint256 pnl; // In basis points (10000 = 100%)
        uint256 winRate; // In basis points
        uint256 trades;
        uint256 copiers;
        uint256 tvl; // Total value locked by copiers
        uint256 registeredAt;
        string basename; // ENS/Basename
    }
    
    mapping(address => Trader) public traders;
    address[] public allTraders;
    
    // Minimum reputation to be eligible for copy trading
    uint256 public constant MIN_COPY_REPUTATION = 650;
    
    // Events
    event TraderRegistered(address indexed trader, uint256 reputation);
    event TraderUpdated(address indexed trader, uint256 pnl, uint256 winRate);
    event CopierAdded(address indexed trader, address indexed copier, uint256 amount);
    event CopierRemoved(address indexed trader, address indexed copier);
    
    constructor() Ownable(msg.sender) {}
    
    function registerTrader(
        address trader,
        uint256 reputation,
        string calldata basename
    ) external onlyOwner {
        require(!traders[trader].registered, "Already registered");
        
        traders[trader] = Trader({
            registered: true,
            reputation: reputation,
            pnl: 10000, // Start at 0% (10000 = 100% = break even)
            winRate: 5000, // 50%
            trades: 0,
            copiers: 0,
            tvl: 0,
            registeredAt: block.timestamp,
            basename: basename
        });
        
        allTraders.push(trader);
        emit TraderRegistered(trader, reputation);
    }
    
    function updateTraderStats(
        address trader,
        uint256 pnl,
        uint256 winRate,
        uint256 trades
    ) external onlyOwner {
        require(traders[trader].registered, "Not registered");
        traders[trader].pnl = pnl;
        traders[trader].winRate = winRate;
        traders[trader].trades = trades;
        emit TraderUpdated(trader, pnl, winRate);
    }
    
    function updateReputation(address trader, uint256 reputation) external onlyOwner {
        require(traders[trader].registered, "Not registered");
        traders[trader].reputation = reputation;
    }
    
    function addCopier(address trader, uint256 amount) external onlyOwner {
        require(traders[trader].registered, "Not registered");
        require(traders[trader].reputation >= MIN_COPY_REPUTATION, "Reputation too low");
        traders[trader].copiers++;
        traders[trader].tvl += amount;
        emit CopierAdded(trader, msg.sender, amount);
    }
    
    function removeCopier(address trader, uint256 amount) external onlyOwner {
        require(traders[trader].registered, "Not registered");
        if (traders[trader].copiers > 0) traders[trader].copiers--;
        if (traders[trader].tvl >= amount) traders[trader].tvl -= amount;
        emit CopierRemoved(trader, msg.sender);
    }
    
    // View functions
    function isEligibleForCopy(address trader) external view returns (bool) {
        return traders[trader].registered && 
               traders[trader].reputation >= MIN_COPY_REPUTATION;
    }
    
    function getTrader(address trader) external view returns (
        bool registered,
        uint256 reputation,
        uint256 pnl,
        uint256 winRate,
        uint256 trades,
        uint256 copiers,
        uint256 tvl
    ) {
        Trader memory t = traders[trader];
        return (t.registered, t.reputation, t.pnl, t.winRate, t.trades, t.copiers, t.tvl);
    }
    
    function getTopTraders(uint256 limit) external view returns (
        address[] memory addresses,
        uint256[] memory pnls,
        uint256[] memory reputations,
        uint256[] memory copierCounts
    ) {
        uint256 count = allTraders.length < limit ? allTraders.length : limit;
        addresses = new address[](count);
        pnls = new uint256[](count);
        reputations = new uint256[](count);
        copierCounts = new uint256[](count);
        
        // Sort by PNL
        address[] memory sorted = new address[](allTraders.length);
        for (uint i = 0; i < allTraders.length; i++) {
            sorted[i] = allTraders[i];
        }
        
        for (uint i = 0; i < sorted.length; i++) {
            for (uint j = i + 1; j < sorted.length; j++) {
                if (traders[sorted[j]].pnl > traders[sorted[i]].pnl) {
                    address temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        
        for (uint i = 0; i < count; i++) {
            addresses[i] = sorted[i];
            pnls[i] = traders[sorted[i]].pnl;
            reputations[i] = traders[sorted[i]].reputation;
            copierCounts[i] = traders[sorted[i]].copiers;
        }
    }
    
    function getTotalTraders() external view returns (uint256) {
        return allTraders.length;
    }
}
