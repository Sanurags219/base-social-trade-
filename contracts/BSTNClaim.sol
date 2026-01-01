// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBSTN {
    function mint(address to, uint256 amount) external;
}

contract BSTNClaim {
    IBSTN public bstn;
    address public admin;

    mapping(address => uint256) public xpSnapshot;
    mapping(address => bool) public claimed;

    uint256 public constant XP_TO_BSTN = 100; // 100 BSTN per 1000 XP

    constructor(address _bstn) {
        bstn = IBSTN(_bstn);
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function setSnapshot(address[] calldata users, uint256[] calldata xp)
        external
        onlyAdmin
    {
        require(users.length == xp.length, "Length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            xpSnapshot[users[i]] = xp[i];
        }
    }

    function claim() external {
        require(!claimed[msg.sender], "Already claimed");
        uint256 xp = xpSnapshot[msg.sender];
        require(xp > 0, "No XP");

        claimed[msg.sender] = true;

        uint256 amount = (xp / 1000) * XP_TO_BSTN * 1e18;
        bstn.mint(msg.sender, amount);
    }
}
