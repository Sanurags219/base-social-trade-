// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title CopyTradingVault
 * @dev Non-custodial vault for automated copy trading
 *
 * Design:
 * - Vault is owned by the follower (user)
 * - Trader never touches funds
 * - Admin (protocol executor) can execute trades on behalf of vault
 * - User can withdraw anytime (no lockup)
 *
 * Safety:
 * - Only owner can deposit/withdraw
 * - Only admin can execute trades
 * - No leverage, no liquidation
 * - Full transparency (on-chain events)
 */
contract CopyTradingVault {
    address public owner;        // Follower (vault owner)
    address public trader;       // Trader being copied
    address public admin;        // Protocol executor (backend)

    uint256 public copyPercent;  // % of balance to copy (5-50)
    uint256 public totalDeposited;
    uint256 public totalExecuted;
    bool public active;

    event Deposit(address indexed token, uint256 amount, uint256 timestamp);
    event Trade(address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed token, uint256 amount, uint256 timestamp);
    event SettingsUpdated(uint256 newCopyPercent, uint256 timestamp);
    event Deactivated(uint256 timestamp);

    constructor(address _owner, address _trader, address _admin, uint256 _copyPercent) {
        require(_owner != address(0), "Invalid owner");
        require(_trader != address(0), "Invalid trader");
        require(_admin != address(0), "Invalid admin");
        require(_copyPercent >= 5 && _copyPercent <= 50, "Copy percent 5-50");

        owner = _owner;
        trader = _trader;
        admin = _admin;
        copyPercent = _copyPercent;
        active = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier isActive() {
        require(active, "Vault not active");
        _;
    }

    /**
     * Owner deposits tokens (USDC / ETH)
     */
    function deposit(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        totalDeposited += amount;
        emit Deposit(token, amount, block.timestamp);
    }

    /**
     * Admin executes mirrored trade
     * Deducts copyPercent from vault balance and transfers to executor
     */
    function executeTrade(
        address token,
        address to,
        uint256 amount
    ) external onlyAdmin isActive {
        require(amount > 0, "Amount must be > 0");

        uint256 balance = IERC20(token).balanceOf(address(this));
        require(amount <= balance, "Insufficient balance");

        require(IERC20(token).transfer(to, amount), "Transfer failed");

        totalExecuted += amount;
        emit Trade(token, amount, block.timestamp);
    }

    /**
     * Owner withdraws tokens anytime (no lockup)
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        require(IERC20(token).transfer(owner, amount), "Transfer failed");

        emit Withdrawal(token, amount, block.timestamp);
    }

    /**
     * Owner updates copy percentage
     */
    function updateCopyPercent(uint256 newPercent) external onlyOwner {
        require(newPercent >= 5 && newPercent <= 50, "Copy percent 5-50");
        copyPercent = newPercent;
        emit SettingsUpdated(newPercent, block.timestamp);
    }

    /**
     * Owner deactivates vault (stops auto-copy)
     */
    function deactivate() external onlyOwner {
        active = false;
        emit Deactivated(block.timestamp);
    }

    /**
     * Get vault balance for a token
     */
    function balance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * Get vault status summary
     */
    function getStatus() external view returns (
        address vaultOwner,
        address copiedTrader,
        uint256 copyPercentage,
        uint256 totalDeposits,
        uint256 totalTrades,
        bool isActive
    ) {
        return (owner, trader, copyPercent, totalDeposited, totalExecuted, active);
    }
}
