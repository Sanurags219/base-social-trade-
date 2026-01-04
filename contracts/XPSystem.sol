// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XPSystem
 * @notice Full on-chain XP tracking for all tasks
 * @dev All tasks recorded on-chain with XP rewards
 */
contract XPSystem is Ownable, ReentrancyGuard {
    IERC20 public bstnToken;

    // Task IDs
    bytes32 public constant TASK_CONNECT = keccak256("connect");
    bytes32 public constant TASK_PORTFOLIO = keccak256("portfolio");
    bytes32 public constant TASK_SHARE = keccak256("share");
    bytes32 public constant TASK_TRADERS = keccak256("traders");
    bytes32 public constant TASK_DAILY = keccak256("daily");
    bytes32 public constant TASK_SWAP_5TX = keccak256("swap_5tx");
    bytes32 public constant TASK_COPY_TRADE = keccak256("copy_trade");

    // XP rewards per task
    mapping(bytes32 => uint256) public taskXP;
    // BSTN rewards per task (if any)
    mapping(bytes32 => uint256) public taskBSTN;

    // User data
    struct UserData {
        uint256 totalXP;
        uint256 totalBSTN;
        uint256 lastDaily;
        uint256 dailyStreak;
        mapping(bytes32 => bool) completedTasks;
    }

    mapping(address => UserData) private users;

    // Events
    event TaskCompleted(address indexed user, bytes32 indexed taskId, uint256 xp, uint256 bstn);
    event DailyCheckin(address indexed user, uint256 streak, uint256 xp);
    event XPUpdated(address indexed user, uint256 newTotal);

    constructor(address _bstnToken) Ownable(msg.sender) {
        bstnToken = IERC20(_bstnToken);
        
        // Set XP rewards
        taskXP[TASK_CONNECT] = 50;
        taskXP[TASK_PORTFOLIO] = 25;
        taskXP[TASK_SHARE] = 100;
        taskXP[TASK_TRADERS] = 30;
        taskXP[TASK_DAILY] = 10;
        taskXP[TASK_SWAP_5TX] = 200;
        taskXP[TASK_COPY_TRADE] = 100;
        
        // Set BSTN rewards (only for major tasks)
        taskBSTN[TASK_SWAP_5TX] = 50 * 1e18;  // 50 BSTN
        taskBSTN[TASK_COPY_TRADE] = 10 * 1e18; // 10 BSTN
    }

    /**
     * @notice Complete a task and earn XP
     * @param taskId The task identifier
     */
    function completeTask(bytes32 taskId) external nonReentrant {
        require(taskXP[taskId] > 0, "Invalid task");
        require(!users[msg.sender].completedTasks[taskId], "Task already completed");
        
        // Special handling for daily task
        if (taskId == TASK_DAILY) {
            _handleDaily(msg.sender);
            return;
        }
        
        users[msg.sender].completedTasks[taskId] = true;
        uint256 xp = taskXP[taskId];
        uint256 bstn = taskBSTN[taskId];
        
        users[msg.sender].totalXP += xp;
        
        // Transfer BSTN if reward exists and vault has balance
        if (bstn > 0 && bstnToken.balanceOf(address(this)) >= bstn) {
            users[msg.sender].totalBSTN += bstn;
            bstnToken.transfer(msg.sender, bstn);
        }
        
        emit TaskCompleted(msg.sender, taskId, xp, bstn);
        emit XPUpdated(msg.sender, users[msg.sender].totalXP);
    }

    /**
     * @notice Daily check-in with streak bonus
     */
    function dailyCheckin() external nonReentrant {
        _handleDaily(msg.sender);
    }

    function _handleDaily(address user) internal {
        uint256 today = block.timestamp / 1 days;
        uint256 lastDay = users[user].lastDaily;
        
        require(today > lastDay, "Already checked in today");
        
        // Check streak
        if (today == lastDay + 1) {
            users[user].dailyStreak += 1;
        } else {
            users[user].dailyStreak = 1;
        }
        
        users[user].lastDaily = today;
        
        // XP with streak bonus (max 3x at 7+ day streak)
        uint256 streakMultiplier = users[user].dailyStreak > 7 ? 3 : (users[user].dailyStreak > 3 ? 2 : 1);
        uint256 xp = taskXP[TASK_DAILY] * streakMultiplier;
        
        users[user].totalXP += xp;
        
        emit DailyCheckin(user, users[user].dailyStreak, xp);
        emit XPUpdated(user, users[user].totalXP);
    }

    /**
     * @notice Get user XP data
     */
    function getUserXP(address user) external view returns (
        uint256 totalXP,
        uint256 totalBSTN,
        uint256 dailyStreak,
        uint256 level,
        uint256 nextLevelXP
    ) {
        totalXP = users[user].totalXP;
        totalBSTN = users[user].totalBSTN;
        dailyStreak = users[user].dailyStreak;
        level = (totalXP / 100) + 1;
        nextLevelXP = level * 100;
    }

    /**
     * @notice Check if user completed a task
     */
    function hasCompletedTask(address user, bytes32 taskId) external view returns (bool) {
        return users[user].completedTasks[taskId];
    }

    /**
     * @notice Check multiple tasks at once
     */
    function getCompletedTasks(address user) external view returns (
        bool connect,
        bool portfolio,
        bool share,
        bool traders,
        bool swap5tx,
        bool copyTrade,
        uint256 lastDaily
    ) {
        connect = users[user].completedTasks[TASK_CONNECT];
        portfolio = users[user].completedTasks[TASK_PORTFOLIO];
        share = users[user].completedTasks[TASK_SHARE];
        traders = users[user].completedTasks[TASK_TRADERS];
        swap5tx = users[user].completedTasks[TASK_SWAP_5TX];
        copyTrade = users[user].completedTasks[TASK_COPY_TRADE];
        lastDaily = users[user].lastDaily;
    }

    /**
     * @notice Get vault BSTN balance
     */
    function getVaultBalance() external view returns (uint256) {
        return bstnToken.balanceOf(address(this));
    }

    /**
     * @notice Owner can update task XP
     */
    function setTaskXP(bytes32 taskId, uint256 xp) external onlyOwner {
        taskXP[taskId] = xp;
    }

    /**
     * @notice Owner can update task BSTN reward
     */
    function setTaskBSTN(bytes32 taskId, uint256 bstn) external onlyOwner {
        taskBSTN[taskId] = bstn;
    }

    /**
     * @notice Owner can withdraw excess tokens
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        bstnToken.transfer(msg.sender, amount);
    }

    /**
     * @notice Update BSTN token address
     */
    function setBSTNToken(address _bstnToken) external onlyOwner {
        bstnToken = IERC20(_bstnToken);
    }
}
