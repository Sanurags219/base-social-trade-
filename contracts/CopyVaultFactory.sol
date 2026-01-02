// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CopyTradingVault.sol";

contract CopyVaultFactory {
    address public admin;
    mapping(address => address[]) public userVaults;
    address[] public allVaults;
    
    event VaultCreated(address indexed owner, address indexed trader, address vault);
    
    constructor() {
        admin = msg.sender;
    }
    
    function createVault(address trader, uint256 copyPercent) external returns (address) {
        CopyTradingVault vault = new CopyTradingVault(
            msg.sender,
            trader,
            admin,
            copyPercent
        );
        
        address vaultAddress = address(vault);
        userVaults[msg.sender].push(vaultAddress);
        allVaults.push(vaultAddress);
        
        emit VaultCreated(msg.sender, trader, vaultAddress);
        return vaultAddress;
    }
    
    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }
    
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }
    
    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "Not admin");
        admin = newAdmin;
    }
}