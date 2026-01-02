// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XPTracker
 * @notice On-chain XP tracking for Baseline users
 * @dev Stores XP, trades, and streak data on Base mainnet
 */
contract XPTracker is Ownable {
    struct UserXP {
        uint256 xp;
        uint256 trades;
        uint256 streak;
        uint256 lastAction;
        uint256 level;
    }
    
    mapping(address => UserXP) public users;
    address[] public allUsers;
    mapping(address => bool) public isUser;
    
    // XP rewards
    uint256 public constant XP_SWAP = 10;
    uint256 public constant XP_COPY = 50;
    uint256 public constant XP_SHARE = 25;
    uint256 public constant XP_DAILY = 100;
    uint256 public constant XP_PER_LEVEL = 1000;
    
    // Authorized callers (API backend)
    mapping(address => bool) public authorized;
    
    event XPEarned(address indexed user, uint256 amount, string action);
    event LevelUp(address indexed user, uint256 newLevel);
    event StreakUpdated(address indexed user, uint256 streak);
    
    constructor() Ownable(msg.sender) {
        authorized[msg.sender] = true;
    }
    
    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function setAuthorized(address addr, bool status) external onlyOwner {
        authorized[addr] = status;
    }
    
    function recordSwap(address user, uint256 volumeUSD) external onlyAuthorized {
        _ensureUser(user);
        uint256 xp = XP_SWAP + (volumeUSD / 100); // 1 XP per $100 volume
        _addXP(user, xp, "swap");
        users[user].trades++;
        _updateStreak(user);
    }
    
    function recordCopy(address user) external onlyAuthorized {
        _ensureUser(user);
        _addXP(user, XP_COPY, "copy");
        _updateStreak(user);
    }
    
    function recordShare(address user) external onlyAuthorized {
        _ensureUser(user);
        _addXP(user, XP_SHARE, "share");
    }
    
    function recordDaily(address user) external onlyAuthorized {
        _ensureUser(user);
        require(
            block.timestamp - users[user].lastAction >= 1 days,
            "Already claimed today"
        );
        _addXP(user, XP_DAILY, "daily");
        _updateStreak(user);
    }
    
    function _ensureUser(address user) internal {
        if (!isUser[user]) {
            isUser[user] = true;
            allUsers.push(user);
            users[user].level = 1;
        }
    }
    
    function _addXP(address user, uint256 amount, string memory action) internal {
        users[user].xp += amount;
        users[user].lastAction = block.timestamp;
        
        uint256 newLevel = (users[user].xp / XP_PER_LEVEL) + 1;
        if (newLevel > users[user].level) {
            users[user].level = newLevel;
            emit LevelUp(user, newLevel);
        }
        
        emit XPEarned(user, amount, action);
    }
    
    function _updateStreak(address user) internal {
        if (block.timestamp - users[user].lastAction < 2 days) {
            users[user].streak++;
        } else {
            users[user].streak = 1;
        }
        emit StreakUpdated(user, users[user].streak);
    }
    
    // View functions
    function getUserXP(address user) external view returns (
        uint256 xp,
        uint256 trades,
        uint256 streak,
        uint256 level,
        uint256 nextLevelXP
    ) {
        UserXP memory u = users[user];
        return (
            u.xp,
            u.trades,
            u.streak,
            u.level == 0 ? 1 : u.level,
            (u.level == 0 ? 1 : u.level) * XP_PER_LEVEL
        );
    }
    
    function getLeaderboard(uint256 limit) external view returns (
        address[] memory addresses,
        uint256[] memory xps,
        uint256[] memory levels
    ) {
        uint256 count = allUsers.length < limit ? allUsers.length : limit;
        addresses = new address[](count);
        xps = new uint256[](count);
        levels = new uint256[](count);
        
        // Simple bubble sort for top users (fine for small datasets)
        address[] memory sorted = new address[](allUsers.length);
        for (uint i = 0; i < allUsers.length; i++) {
            sorted[i] = allUsers[i];
        }
        
        for (uint i = 0; i < sorted.length; i++) {
            for (uint j = i + 1; j < sorted.length; j++) {
                if (users[sorted[j]].xp > users[sorted[i]].xp) {
                    address temp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = temp;
                }
            }
        }
        
        for (uint i = 0; i < count; i++) {
            addresses[i] = sorted[i];
            xps[i] = users[sorted[i]].xp;
            levels[i] = users[sorted[i]].level;
        }
    }
    
    function getTotalUsers() external view returns (uint256) {
        return allUsers.length;
    }
}
