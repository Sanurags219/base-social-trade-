// Script to create events in EventRegistry contract
const { ethers } = require("hardhat");

const EVENT_REGISTRY = "0xe1ebc0804a5f298d07f4544bf3fe1bb00ac31776";

const EVENTS = [
  {
    id: "genesis",
    title: "Baseline Genesis",
    xpReward: 500,
    sbtReward: true,
    maxParticipants: 0, // unlimited
    endTime: 0 // no end
  },
  {
    id: "swap-challenge",
    title: "Swap Challenge",
    xpReward: 100,
    sbtReward: false,
    maxParticipants: 0,
    endTime: 0
  },
  {
    id: "copy-trade",
    title: "Copy Trade Challenge",
    xpReward: 100,
    sbtReward: false,
    maxParticipants: 0,
    endTime: 0
  },
  {
    id: "daily-login",
    title: "Daily Onchain Check-in",
    xpReward: 50,
    sbtReward: false,
    maxParticipants: 0,
    endTime: 0
  },
  {
    id: "share-baseline",
    title: "Share Baseline",
    xpReward: 50,
    sbtReward: false,
    maxParticipants: 0,
    endTime: 0
  }
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating events with account:", deployer.address);

  const eventRegistry = await ethers.getContractAt(
    [
      "function createEvent(string calldata id, string calldata title, uint256 xpReward, bool sbtReward, uint256 maxParticipants, uint256 endTime) external",
      "function getTotalEvents() external view returns (uint256)",
      "function owner() external view returns (address)"
    ],
    EVENT_REGISTRY,
    deployer
  );

  // Check owner
  const owner = await eventRegistry.owner();
  console.log("Contract owner:", owner);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("ERROR: Deployer is not the owner!");
    console.error("Deployer:", deployer.address);
    console.error("Owner:", owner);
    return;
  }

  const totalBefore = await eventRegistry.getTotalEvents();
  console.log("Total events before:", totalBefore.toString());

  for (const event of EVENTS) {
    try {
      console.log(`\nCreating event: ${event.title}...`);
      const tx = await eventRegistry.createEvent(
        event.id,
        event.title,
        event.xpReward,
        event.sbtReward,
        event.maxParticipants,
        event.endTime
      );
      console.log("TX:", tx.hash);
      await tx.wait();
      console.log(` Created: ${event.title}`);
    } catch (error) {
      if (error.message.includes("Event exists")) {
        console.log(` Event already exists: ${event.title}`);
      } else {
        console.error(` Failed: ${event.title}`, error.message);
      }
    }
  }

  const totalAfter = await eventRegistry.getTotalEvents();
  console.log("\nTotal events after:", totalAfter.toString());
  console.log("Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
