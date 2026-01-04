// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaselineClaims {
    mapping(address => mapping(bytes32 => bool)) public claimed;
    mapping(address => uint256) public totalXP;
    
    event Claimed(address indexed user, bytes32 indexed eventId, uint256 xp, uint256 timestamp);
    
    function claim(bytes32 eventId, uint256 xp) external {
        require(!claimed[msg.sender][eventId], "Already claimed");
        claimed[msg.sender][eventId] = true;
        totalXP[msg.sender] += xp;
        emit Claimed(msg.sender, eventId, xp, block.timestamp);
    }
    
    function hasClaimed(address user, bytes32 eventId) external view returns (bool) {
        return claimed[user][eventId];
    }
    
    function batchClaim(bytes32[] calldata eventIds, uint256[] calldata xps) external {
        require(eventIds.length == xps.length, "Length mismatch");
        for (uint i = 0; i < eventIds.length; i++) {
            if (!claimed[msg.sender][eventIds[i]]) {
                claimed[msg.sender][eventIds[i]] = true;
                totalXP[msg.sender] += xps[i];
                emit Claimed(msg.sender, eventIds[i], xps[i], block.timestamp);
            }
        }
    }
}
