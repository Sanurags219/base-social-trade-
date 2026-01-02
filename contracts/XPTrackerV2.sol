// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XPTrackerV2
 * @notice On-chain XP tracking with PUBLIC daily claim for Baseline users
 * @dev Anyone can claim daily XP - no authorization needed
 */
contract XPTrackerV2 is Ownable {
    struct UserXP {
        uint256 xp;
        uint256 trades;
        uint256 streak;
        uint256 lastClaim;
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
    
    // Authorized callers for swap/copy/share
    mapping(address => bool) public authorized;
    
    event XPEarned(address indexed user, uint256 amount, string action);
    event LevelUp(address indexed user, uint256 newLevel);
    event StreakUpdated(address indexed user, uint256 streak);
    event DailyClaimed(address indexed user, uint256 streak);
    
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
    
    /**
     * @notice PUBLIC function - anyone can claim daily XP for themselves
     * @dev No authorization required - users claim directly
     */
    function claimDaily() external {
        address user = msg.sender;
        _ensureUser(user);
        
        // Check 24 hour cooldown
        require(
            block.timestamp - users[user].lastClaim >= 1 days,
            "Already claimed today"
        );
        
        // Update streak
        if (block.timestamp - users[user].lastClaim <= 2 days) {
            users[user].streak++;
        } else {
            users[user].streak = 1;
        }
        
        users[user].lastClaim = block.timestamp;
        
        // Calculate XP with streak bonus
        uint256 streakBonus = users[user].streak > 7 ? 50 : users[user].streak * 5;
        uint256 totalXP = XP_DAILY + streakBonus;
        
        _addXP(user, totalXP, "daily");
        
        emit DailyClaimed(user, users[user].streak);
    }
    
    /**
     * @notice Check if user can claim daily XP
     */
    function canClaimDaily(address user) external view returns (bool) {
        if (!isUser[user]) return true;
        return block.timestamp - users[user].lastClaim >= 1 days;
    }
    
    /**
     * @notice Get time until next claim available (in seconds)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (!isUser[user]) return 0;
        uint256 timeSince = block.timestamp - users[user].lastClaim;
        if (timeSince >= 1 days) return 0;
        return 1 days - timeSince;
    }
    
    // Authorized functions for backend
    function recordSwap(address user, uint256 volumeUSD) external onlyAuthorized {
        _ensureUser(user);
        uint256 xp = XP_SWAP + (volumeUSD / 100);
        _addXP(user, xp, "swap");
        users[user].trades++;
    }
    
    function recordCopy(address user) external onlyAuthorized {
        _ensureUser(user);
        _addXP(user, XP_COPY, "copy");
    }
    
    function recordShare(address user) external onlyAuthorized {
        _ensureUser(user);
        _addXP(user, XP_SHARE, "share");
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
        
        uint256 newLevel = (users[user].xp / XP_PER_LEVEL) + 1;
        if (newLevel > users[user].level) {
            users[user].level = newLevel;
            emit LevelUp(user, newLevel);
        }
        
        emit XPEarned(user, amount, action);
    }
    
    // View functions
    function getUserXP(address user) external view returns (
        uint256 xp,
        uint256 trades,
        uint256 streak,
        uint256 level,
        uint256 nextLevelXP
    ) {
        UserXP storage u = users[user];
        xp = u.xp;
        trades = u.trades;
        streak = u.streak;
        level = u.level > 0 ? u.level : 1;
        nextLevelXP = level * XP_PER_LEVEL;
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
        
        // Simple copy (not sorted - frontend can sort)
        for (uint256 i = 0; i < count; i++) {
            addresses[i] = allUsers[i];
            xps[i] = users[allUsers[i]].xp;
            levels[i] = users[allUsers[i]].level;
        }
    }
    
    function totalUsers() external view returns (uint256) {
        return allUsers.length;
    }
}
