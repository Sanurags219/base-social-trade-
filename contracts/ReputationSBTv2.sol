// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSBT is ERC721, Ownable {
    struct Reputation {
        uint256 score;
        uint256 lastUpdated;
    }

    mapping(address => Reputation) public reputation;
    mapping(address => bool) public hasClaimed;

    uint256 public tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 30000;
    uint256 public constant INITIAL_SCORE = 500;

    event SBTClaimed(address indexed user, uint256 tokenId, uint256 score);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore);

    constructor() ERC721("Baseline Reputation", "BREP") Ownable(msg.sender) {}

    // Public claim - 1 per wallet
    function claim() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(tokenIdCounter < MAX_SUPPLY, "Max supply reached");

        tokenIdCounter++;
        _mint(msg.sender, tokenIdCounter);
        hasClaimed[msg.sender] = true;

        reputation[msg.sender] = Reputation({
            score: INITIAL_SCORE,
            lastUpdated: block.timestamp
        });

        emit SBTClaimed(msg.sender, tokenIdCounter, INITIAL_SCORE);
    }

    // Owner can update reputation score
    function updateScore(address user, uint256 newScore) external onlyOwner {
        require(hasClaimed[user], "User has no SBT");
        require(newScore <= 1000, "Score max 1000");

        uint256 oldScore = reputation[user].score;
        reputation[user] = Reputation({
            score: newScore,
            lastUpdated: block.timestamp
        });

        emit ReputationUpdated(user, oldScore, newScore);
    }

    // View functions
    function getReputation(address user) external view returns (uint256 score, uint256 lastUpdated) {
        if (!hasClaimed[user]) return (0, 0);
        Reputation memory rep = reputation[user];
        return (rep.score, rep.lastUpdated);
    }

    function hasSBT(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    function totalSupply() external view returns (uint256) {
        return tokenIdCounter;
    }

    // Soulbound: disable transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }
}
