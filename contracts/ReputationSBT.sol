// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSBT is ERC721, Ownable {
    struct Reputation {
        uint256 score;        // 0 - 1000
        uint256 lastUpdated;  // timestamp
    }

    mapping(address => Reputation) public reputation;
    mapping(address => bool) public hasSBT;

    uint256 public tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 30000;

    event ReputationIssued(address indexed user, uint256 score, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, uint256 timestamp);

    constructor() ERC721("Onchain Reputation", "REP") Ownable(msg.sender) {}

    // mint or update reputation
    function issueOrUpdate(address user, uint256 score)
        external
        onlyOwner
    {
        require(user != address(0), "Invalid address");
        require(score <= 1000, "Score too high");

        if (!hasSBT[user]) {
            require(tokenIdCounter < MAX_SUPPLY, "Max supply reached");
            tokenIdCounter++;
            _mint(user, tokenIdCounter);
            hasSBT[user] = true;
            emit ReputationIssued(user, score, block.timestamp);
        } else {
            uint256 oldScore = reputation[user].score;
            emit ReputationUpdated(user, oldScore, score, block.timestamp);
        }

        reputation[user] = Reputation({
            score: score,
            lastUpdated: block.timestamp
        });
    }

    // get reputation for user
    function getReputation(address user)
        external
        view
        returns (uint256 score, uint256 lastUpdated)
    {
        if (!hasSBT[user]) {
            return (0, 0);
        }
        Reputation memory rep = reputation[user];
        return (rep.score, rep.lastUpdated);
    }

    // check if user has SBT
    function hasSBTFor(address user) external view returns (bool) {
        return hasSBT[user];
    }

    // Soulbound: disable transfers
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }
}
