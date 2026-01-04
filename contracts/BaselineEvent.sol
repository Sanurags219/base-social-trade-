// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BaselineEvent is ERC721URIStorage, Ownable {
    // XP and SBT logic
    mapping(address => uint256) public xp;
    mapping(address => bool) public claimedGenesis;
    mapping(address => uint256) public dailyClaimed;
    mapping(address => uint256) public swapCount;
    mapping(address => uint256) public txCountToday;
    mapping(address => uint256) public lastTxDay;
    mapping(address => bool) public claimedCopyTrade;
    mapping(address => uint256) public lastShareDay;
    mapping(address => uint256) public lastTxXpDay;
    mapping(address => uint256) public txXpToday;
    uint256 public tokenIdCounter;
    uint256 public immutable genesisReward = 500;
    uint256 public immutable swapReward = 100;
    uint256 public immutable dailyReward = 50;
    uint256 public immutable shareReward = 50;
    uint256 public immutable txReward = 10;
    uint256 public immutable txRewardCap = 100;
    uint256 public immutable copyTradeReward = 100;

    event GenesisClaimed(address indexed user, uint256 tokenId);
    event SwapProgress(address indexed user, uint256 count);
    event SwapClaimed(address indexed user);
    event DailyClaimed(address indexed user, uint256 day);
    event ShareClaimed(address indexed user, uint256 day);
    event TxXpClaimed(address indexed user, uint256 day, uint256 count);
    event CopyTradeClaimed(address indexed user);

    constructor() ERC721("Baseline Genesis SBT", "BGSBT") {}

    // Utility: get current day (UTC)
    function _currentDay() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    // 1️⃣ Genesis Event — Claim SBT + 500 XP
    function claimGenesis() external {
        require(!claimedGenesis[msg.sender], "Already claimed");
        claimedGenesis[msg.sender] = true;
        xp[msg.sender] += genesisReward;
        tokenIdCounter++;
        _safeMint(msg.sender, tokenIdCounter);
        emit GenesisClaimed(msg.sender, tokenIdCounter);
    }

    // 2️⃣ Swap Challenge — 5 swaps ≥ $10 each → 100 XP
    function recordSwap(address user, uint256 usdValue) external onlyOwner {
        require(usdValue >= 10 * 1e18, "Swap < $10");
        swapCount[user]++;
        emit SwapProgress(user, swapCount[user]);
    }
    function claimSwap() external {
        require(swapCount[msg.sender] >= 5, "Not enough swaps");
        require(xp[msg.sender] < genesisReward + swapReward, "Already claimed");
        xp[msg.sender] += swapReward;
        emit SwapClaimed(msg.sender);
    }

    // 3️⃣ Daily Login (Onchain) — 50 XP
    function claimDaily() external {
        uint256 today = _currentDay();
        require(dailyClaimed[msg.sender] < today, "Already claimed today");
        dailyClaimed[msg.sender] = today;
        xp[msg.sender] += dailyReward;
        emit DailyClaimed(msg.sender, today);
    }

    // 4️⃣ Share Baseline — 50 XP
    function claimShare() external {
        uint256 today = _currentDay();
        require(lastShareDay[msg.sender] < today, "Already claimed");
        lastShareDay[msg.sender] = today;
        xp[msg.sender] += shareReward;
        emit ShareClaimed(msg.sender, today);
    }

    // 5️⃣ Every Transaction — 10 XP, cap 100/day
    function recordTx(address user) external onlyOwner {
        uint256 today = _currentDay();
        if (lastTxXpDay[user] < today) {
            txXpToday[user] = 0;
            lastTxXpDay[user] = today;
        }
        require(txXpToday[user] < txRewardCap, "XP cap reached");
        txXpToday[user] += txReward;
        xp[user] += txReward;
        emit TxXpClaimed(user, today, txXpToday[user]);
    }

    // 6️⃣ Copy Trade Event — $10 minimum → 100 XP
    function claimCopyTrade() external {
        require(!claimedCopyTrade[msg.sender], "Already claimed");
        claimedCopyTrade[msg.sender] = true;
        xp[msg.sender] += copyTradeReward;
        emit CopyTradeClaimed(msg.sender);
    }

    // Admin: set token URI for SBT
    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        _setTokenURI(tokenId, uri);
    }

    // View: get user XP
    function getXP(address user) external view returns (uint256) {
        return xp[user];
    }
}
