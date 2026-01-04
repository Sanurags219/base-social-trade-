// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardsVault
 * @notice On-chain rewards for completing tasks - 5 tx reward + copy trade reward
 * @dev Distributes XP points and BSTN tokens for completed tasks
 */
contract RewardsVault is Ownable, ReentrancyGuard {
    IERC20 public bstnToken;
    
    // Reward amounts
    uint256 public constant SWAP_XP_REWARD = 200;
    uint256 public constant SWAP_BSTN_REWARD = 50 * 1e18; // 50 BSTN
    uint256 public constant COPY_XP_REWARD = 100;
    uint256 public constant COPY_BSTN_REWARD = 10 * 1e18; // 10 BSTN
    uint256 public constant MIN_TX_COUNT = 5;
    
    // User data
    struct UserRewards {
        uint256 xp;
        uint256 bstnClaimed;
        bool hasClaimedSwapReward;
        bool hasClaimedCopyReward;
    }
    
    mapping(address => UserRewards) public users;
    
    // Events
    event SwapRewardClaimed(address indexed user, uint256 txCount, uint256 xp, uint256 bstn);
    event CopyRewardClaimed(address indexed user, uint256 xp, uint256 bstn);
    event TokensDeposited(uint256 amount);
    event TokensWithdrawn(uint256 amount);
    
    constructor(address _bstnToken) Ownable(msg.sender) {
        bstnToken = IERC20(_bstnToken);
    }
    
    /**
     * @notice Claim reward for completing 5+ swap transactions
     * @param user The user address claiming
     * @param txCount The number of transactions completed (verified off-chain)
     */
    function claimSwapReward(address user, uint256 txCount) external nonReentrant {
        require(msg.sender == user, "Can only claim for yourself");
        require(!users[user].hasClaimedSwapReward, "Already claimed swap reward");
        require(txCount >= MIN_TX_COUNT, "Need 5+ transactions");
        
        users[user].hasClaimedSwapReward = true;
        users[user].xp += SWAP_XP_REWARD;
        users[user].bstnClaimed += SWAP_BSTN_REWARD;
        
        // Transfer BSTN tokens
        uint256 balance = bstnToken.balanceOf(address(this));
        if (balance >= SWAP_BSTN_REWARD) {
            bstnToken.transfer(user, SWAP_BSTN_REWARD);
        }
        
        emit SwapRewardClaimed(user, txCount, SWAP_XP_REWARD, SWAP_BSTN_REWARD);
    }
    
    /**
     * @notice Claim reward for using copy trading
     * @param user The user address claiming
     */
    function claimCopyTradeReward(address user) external nonReentrant {
        require(msg.sender == user, "Can only claim for yourself");
        require(!users[user].hasClaimedCopyReward, "Already claimed copy reward");
        
        users[user].hasClaimedCopyReward = true;
        users[user].xp += COPY_XP_REWARD;
        users[user].bstnClaimed += COPY_BSTN_REWARD;
        
        // Transfer BSTN tokens
        uint256 balance = bstnToken.balanceOf(address(this));
        if (balance >= COPY_BSTN_REWARD) {
            bstnToken.transfer(user, COPY_BSTN_REWARD);
        }
        
        emit CopyRewardClaimed(user, COPY_XP_REWARD, COPY_BSTN_REWARD);
    }
    
    /**
     * @notice Get user XP and rewards data
     */
    function getUserXP(address user) external view returns (
        uint256 xp,
        uint256 trades,
        uint256 streak,
        uint256 level,
        uint256 nextLevelXP
    ) {
        UserRewards storage u = users[user];
        xp = u.xp;
        trades = 0; // Not tracked in this contract
        streak = 0; // Not tracked in this contract
        level = (xp / 1000) + 1;
        nextLevelXP = level * 1000;
    }
    
    /**
     * @notice Check if user has claimed swap reward
     */
    function hasClaimedSwapReward(address user) external view returns (bool) {
        return users[user].hasClaimedSwapReward;
    }
    
    /**
     * @notice Check if user has claimed copy trade reward
     */
    function hasClaimedCopyReward(address user) external view returns (bool) {
        return users[user].hasClaimedCopyReward;
    }
    
    /**
     * @notice Get vault BSTN balance
     */
    function getVaultBalance() external view returns (uint256) {
        return bstnToken.balanceOf(address(this));
    }
    
    /**
     * @notice Owner can deposit BSTN tokens
     */
    function depositTokens(uint256 amount) external onlyOwner {
        bstnToken.transferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(amount);
    }
    
    /**
     * @notice Owner can withdraw excess BSTN tokens
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        bstnToken.transfer(msg.sender, amount);
        emit TokensWithdrawn(amount);
    }
    
    /**
     * @notice Update BSTN token address
     */
    function setBSTNToken(address _bstnToken) external onlyOwner {
        bstnToken = IERC20(_bstnToken);
    }
}
