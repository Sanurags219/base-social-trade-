// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventRegistry
 * @notice On-chain event tracking for Baseline campaigns
 * @dev Stores events, claims, and participant data on-chain
 */
contract EventRegistry is Ownable {
    enum EventStatus { Active, Upcoming, Ended }
    enum EventType { Launch, Challenge, EarlySupporter, Partner }
    
    struct EventRewards {
        bool sbt;
        uint256 xp;
        address token;
        uint256 tokenAmount;
    }
    
    struct Event {
        string title;
        string description;
        EventType eventType;
        EventStatus status;
        EventRewards rewards;
        uint256 participants;
        uint256 maxParticipants;
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }
    
    mapping(bytes32 => Event) public events;
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;
    bytes32[] public eventIds;
    
    // Reference to ReputationSBT for minting
    address public reputationSBT;
    
    event EventCreated(bytes32 indexed eventId, string title);
    event EventClaimed(bytes32 indexed eventId, address indexed user, uint256 xp);
    event EventStatusChanged(bytes32 indexed eventId, EventStatus status);
    
    constructor(address _reputationSBT) Ownable(msg.sender) {
        reputationSBT = _reputationSBT;
    }
    
    function createEvent(
        string calldata id,
        string calldata title,
        string calldata description,
        EventType eventType,
        bool sbtReward,
        uint256 xpReward,
        address tokenReward,
        uint256 tokenAmount,
        uint256 maxParticipants,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner {
        bytes32 eventId = keccak256(abi.encodePacked(id));
        require(!events[eventId].exists, "Event already exists");
        
        events[eventId] = Event({
            title: title,
            description: description,
            eventType: eventType,
            status: block.timestamp >= startTime ? EventStatus.Active : EventStatus.Upcoming,
            rewards: EventRewards({
                sbt: sbtReward,
                xp: xpReward,
                token: tokenReward,
                tokenAmount: tokenAmount
            }),
            participants: 0,
            maxParticipants: maxParticipants,
            startTime: startTime,
            endTime: endTime,
            exists: true
        });
        
        eventIds.push(eventId);
        emit EventCreated(eventId, title);
    }
    
    function claim(bytes32 eventId) external {
        Event storage evt = events[eventId];
        require(evt.exists, "Event does not exist");
        require(evt.status == EventStatus.Active, "Event not active");
        require(!hasClaimed[eventId][msg.sender], "Already claimed");
        require(
            evt.maxParticipants == 0 || evt.participants < evt.maxParticipants,
            "Event full"
        );
        
        hasClaimed[eventId][msg.sender] = true;
        evt.participants++;
        
        // Mint SBT if reward includes it
        if (evt.rewards.sbt && reputationSBT != address(0)) {
            // Call ReputationSBT.mintReputation(user, 100)
            (bool success, ) = reputationSBT.call(
                abi.encodeWithSignature("mintReputation(address,uint256)", msg.sender, 100)
            );
            // Don't revert if mint fails (user might already have SBT)
            success; // Silence unused variable warning
        }
        
        emit EventClaimed(eventId, msg.sender, evt.rewards.xp);
    }
    
    function updateEventStatus(bytes32 eventId, EventStatus status) external onlyOwner {
        require(events[eventId].exists, "Event does not exist");
        events[eventId].status = status;
        emit EventStatusChanged(eventId, status);
    }
    
    function setReputationSBT(address _reputationSBT) external onlyOwner {
        reputationSBT = _reputationSBT;
    }
    
    // View functions
    function getEvent(bytes32 eventId) external view returns (
        string memory title,
        string memory description,
        EventType eventType,
        EventStatus status,
        uint256 participants,
        uint256 maxParticipants,
        bool sbtReward,
        uint256 xpReward
    ) {
        Event memory evt = events[eventId];
        return (
            evt.title,
            evt.description,
            evt.eventType,
            evt.status,
            evt.participants,
            evt.maxParticipants,
            evt.rewards.sbt,
            evt.rewards.xp
        );
    }
    
    function hasUserClaimed(bytes32 eventId, address user) external view returns (bool) {
        return hasClaimed[eventId][user];
    }
    
    function getActiveEvents() external view returns (bytes32[] memory) {
        uint256 activeCount = 0;
        for (uint i = 0; i < eventIds.length; i++) {
            if (events[eventIds[i]].status == EventStatus.Active) {
                activeCount++;
            }
        }
        
        bytes32[] memory active = new bytes32[](activeCount);
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
