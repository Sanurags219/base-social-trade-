// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReputation {
    function reputation(address user)
        external
        view
        returns (uint256 score, uint256);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ReputationCreditVault
 * @dev Under-collateralized lending based on reputation scores
 * 
 * Credit Tiers:
 * - Elite (850+): $5,000 USDC
 * - Trusted (650-849): $1,500 USDC
 * - Regular (400-649): $300 USDC
 * - New (<400): No credit
 * 
 * Rules:
 * - One active loan per wallet
 * - 14-day fixed term
 * - No interest, no leverage
 * - Late repayment → reputation penalty
 */
contract ReputationCreditVault {
    IERC20 public usdc;
    IReputation public rep;
    address public admin;

    struct Loan {
        uint256 amount;
        uint256 borrowedAt;
        uint256 dueAt;
        bool repaid;
        bool defaulted;
    }

    mapping(address => Loan) public loans;
    uint256 public totalLoaned;
    uint256 public totalRepaid;

    event LoanCreated(address indexed borrower, uint256 amount, uint256 dueAt);
    event LoanRepaid(address indexed borrower, uint256 amount);
    event LoanDefaulted(address indexed borrower, uint256 amount);

    constructor(address _usdc, address _rep) {
        usdc = IERC20(_usdc);
        rep = IReputation(_rep);
        admin = msg.sender;
    }

    /**
     * Get credit limit based on reputation score
     */
    function creditLimit(address user) public view returns (uint256) {
        (uint256 score, ) = rep.reputation(user);

        if (score >= 850) return 5_000e6; // $5,000 USDC
        if (score >= 650) return 1_500e6; // $1,500 USDC
        if (score >= 400) return 300e6;   // $300 USDC
        return 0;                         // No credit
    }

    /**
     * Get user's current credit tier name
     */
    function creditTier(address user) public view returns (string memory) {
        (uint256 score, ) = rep.reputation(user);

        if (score >= 850) return "Elite";
        if (score >= 650) return "Trusted";
        if (score >= 400) return "Regular";
        return "New";
    }

    /**
     * Borrow USDC against reputation
     * @param amount Amount of USDC to borrow (6 decimals)
     */
    function borrow(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient vault balance");

        Loan storage loan = loans[msg.sender];

        // Check no active loan
        require(
            loan.amount == 0 || loan.repaid || loan.defaulted,
            "Active loan exists"
        );

        // Check credit limit
        uint256 limit = creditLimit(msg.sender);
        require(limit > 0, "No credit available");
        require(amount <= limit, "Exceeds credit limit");

        // Create loan
        uint256 dueAt = block.timestamp + 14 days;
        loans[msg.sender] = Loan({
            amount: amount,
            borrowedAt: block.timestamp,
            dueAt: dueAt,
            repaid: false,
            defaulted: false
        });

        totalLoaned += amount;

        // Transfer USDC to borrower
        require(usdc.transfer(msg.sender, amount), "Transfer failed");

        emit LoanCreated(msg.sender, amount, dueAt);
    }

    /**
     * Repay loan in full
     */
    function repay() external {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid && !loan.defaulted, "Loan already settled");

        // Transfer USDC from borrower to vault
        require(
            usdc.transferFrom(msg.sender, address(this), loan.amount),
            "Transfer failed"
        );

        loan.repaid = true;
        totalRepaid += loan.amount;

        emit LoanRepaid(msg.sender, loan.amount);
    }

    /**
     * Admin marks loan as defaulted (after grace period)
     * Called by oracle/keeper after 14 days + grace period
     */
    function markDefaulted(address borrower) external {
        require(msg.sender == admin, "Admin only");
        Loan storage loan = loans[borrower];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid && !loan.defaulted, "Loan already settled");
        require(block.timestamp > loan.dueAt, "Loan not yet due");

        loan.defaulted = true;
        emit LoanDefaulted(borrower, loan.amount);
    }

    /**
     * Get user's active loan details
     */
    function getLoan(address user)
        external
        view
        returns (
            uint256 amount,
            uint256 borrowedAt,
            uint256 dueAt,
            bool repaid,
            bool defaulted,
            bool isOverdue
        )
    {
        Loan storage loan = loans[user];
        return (
            loan.amount,
            loan.borrowedAt,
            loan.dueAt,
            loan.repaid,
            loan.defaulted,
            block.timestamp > loan.dueAt && !loan.repaid && !loan.defaulted
        );
    }

    /**
     * Deposit USDC to vault (admin)
     */
    function deposit(uint256 amount) external {
        require(msg.sender == admin, "Admin only");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    /**
     * Withdraw from vault (admin)
     */
    function withdraw(uint256 amount) external {
        require(msg.sender == admin, "Admin only");
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
    }
}
