// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventRegistry
 * @notice Simplified on-chain event tracking for Baseline campaigns
 */
contract EventRegistry is Ownable {
    enum EventStatus { Active, Upcoming, Ended }
    
    struct Event {
        string title;
        EventStatus status;
        uint256 xpReward;
        bool sbtReward;
        uint256 participants;
        uint256 maxParticipants;
        uint256 endTime;
        bool exists;
    }
    
    mapping(bytes32 => Event) public events;
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;
    bytes32[] public eventIds;
    
    address public reputationSBT;
    
    event EventCreated(bytes32 indexed eventId, string title);
    event EventClaimed(bytes32 indexed eventId, address indexed user, uint256 xp);
    
    constructor(address _reputationSBT) Ownable(msg.sender) {
        reputationSBT = _reputationSBT;
    }
    
    function createEvent(
        string calldata id,
        string calldata title,
        uint256 xpReward,
        bool sbtReward,
        uint256 maxParticipants,
        uint256 endTime
    ) external onlyOwner {
        bytes32 eventId = keccak256(abi.encodePacked(id));
        require(!events[eventId].exists, "Event exists");
        
        events[eventId] = Event({
            title: title,
            status: EventStatus.Active,
            xpReward: xpReward,
            sbtReward: sbtReward,
            participants: 0,
            maxParticipants: maxParticipants,
            endTime: endTime,
            exists: true
        });
        
        eventIds.push(eventId);
        emit EventCreated(eventId, title);
    }
    
    function claim(bytes32 eventId) external {
        Event storage evt = events[eventId];
        require(evt.exists, "Not found");
        require(evt.status == EventStatus.Active, "Not active");
        require(!hasClaimed[eventId][msg.sender], "Claimed");
        require(evt.maxParticipants == 0 || evt.participants < evt.maxParticipants, "Full");
        
        hasClaimed[eventId][msg.sender] = true;
        evt.participants++;
        
        if (evt.sbtReward && reputationSBT != address(0)) {
            (bool success, ) = reputationSBT.call(
                abi.encodeWithSignature("mintReputation(address,uint256)", msg.sender, 100)
            );
            success;
        }
        
        emit EventClaimed(eventId, msg.sender, evt.xpReward);
    }
    
    function updateStatus(bytes32 eventId, EventStatus status) external onlyOwner {
        events[eventId].status = status;
    }
    
    function setReputationSBT(address _sbt) external onlyOwner {
        reputationSBT = _sbt;
    }
    
    function getEvent(bytes32 eventId) external view returns (
        string memory title,
        EventStatus status,
        uint256 xpReward,
        bool sbtReward,
        uint256 participants,
        uint256 maxParticipants
    ) {
        Event memory e = events[eventId];
        return (e.title, e.status, e.xpReward, e.sbtReward, e.participants, e.maxParticipants);
    }
    
    function hasUserClaimed(bytes32 eventId, address user) external view returns (bool) {
        return hasClaimed[eventId][user];
    }
    
    function getActiveEvents() external view returns (bytes32[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < eventIds.length; i++) {
            if (events[eventIds[i]].status == EventStatus.Active) count++;
        }
        
        bytes32[] memory active = new bytes32[](count);
        uint256 j = 0;
        for (uint i = 0; i < eventIds.length; i++) {
            if (events[eventIds[i]].status == EventStatus.Active) {
                active[j++] = eventIds[i];
            }
        }
        return active;
    }
    
    function getTotalEvents() external view returns (uint256) {
        return eventIds.length;
    }
}
