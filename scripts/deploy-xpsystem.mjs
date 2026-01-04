import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as fs from 'fs'
import solc from 'solc'

const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER
const BSTN_TOKEN = '0xa6cd42c89fec11a1fd78c2f23d000db25b3f2f4c'
const OWNER = '0x22E228AdE324185123A54Ad25F3459a99CF51E7a'

if (!PRIVATE_KEY) {
  console.error('Set PRIVATE_KEY_DEPLOYER in .env.local')
  process.exit(1)
}

const account = privateKeyToAccount(PRIVATE_KEY)
console.log('Deploying from:', account.address)

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Read and compile contract
function compileContract() {
  console.log('Compiling XPSystem.sol...')
  
  const xpSource = fs.readFileSync('contracts/XPSystem.sol', 'utf8').replace(/^\uFEFF/, '')
  
  // OpenZeppelin sources (inline minimal versions)
  const ierc20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}`

  const ownable = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
abstract contract Context {
    function _msgSender() internal view virtual returns (address) { return msg.sender; }
    function _msgData() internal view virtual returns (bytes calldata) { return msg.data; }
}
abstract contract Ownable is Context {
    address private _owner;
    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert OwnableInvalidOwner(address(0));
        _transferOwnership(initialOwner);
    }
    modifier onlyOwner() {
        _checkOwner();
        _;
    }
    function owner() public view virtual returns (address) { return _owner; }
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) revert OwnableUnauthorizedAccount(_msgSender());
    }
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) revert OwnableInvalidOwner(address(0));
        _transferOwnership(newOwner);
    }
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}`

  const reentrancyGuard = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;
    error ReentrancyGuardReentrantCall();
    constructor() { _status = NOT_ENTERED; }
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }
    function _nonReentrantBefore() private {
        if (_status == ENTERED) revert ReentrancyGuardReentrantCall();
        _status = ENTERED;
    }
    function _nonReentrantAfter() private { _status = NOT_ENTERED; }
}`

  const input = {
    language: 'Solidity',
    sources: {
      'XPSystem.sol': { content: xpSource },
      '@openzeppelin/contracts/token/ERC20/IERC20.sol': { content: ierc20 },
      '@openzeppelin/contracts/access/Ownable.sol': { content: ownable },
      '@openzeppelin/contracts/utils/ReentrancyGuard.sol': { content: reentrancyGuard }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))
  
  if (output.errors) {
    output.errors.forEach(e => console.log(e.formattedMessage))
    const hasErrors = output.errors.some(e => e.severity === 'error')
    if (hasErrors) process.exit(1)
  }

  const contract = output.contracts['XPSystem.sol']['XPSystem']
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  }
}

async function deploy() {
  const { abi, bytecode } = compileContract()
  
  console.log('Deploying XPSystem to Base Mainnet...')
  console.log('BSTN Token:', BSTN_TOKEN)
  
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [BSTN_TOKEN]
  })
  
  console.log('Tx hash:', hash)
  console.log('Waiting for confirmation...')
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('XPSystem deployed at:', receipt.contractAddress)
  
  // Transfer ownership
  console.log('Transferring ownership to:', OWNER)
  const transferHash = await walletClient.writeContract({
    address: receipt.contractAddress,
    abi,
    functionName: 'transferOwnership',
    args: [OWNER]
  })
  await publicClient.waitForTransactionReceipt({ hash: transferHash })
  console.log('Ownership transferred!')
  
  console.log('\n=== DEPLOYMENT COMPLETE ===')
  console.log('XPSystem:', receipt.contractAddress)
  console.log('BSTN Token:', BSTN_TOKEN)
  console.log('Owner:', OWNER)
  
  return receipt.contractAddress
}

deploy().catch(console.error)
