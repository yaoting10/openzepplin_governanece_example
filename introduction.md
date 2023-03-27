## **End to end demo of simple Openzepplin Dao**

### **1背景**

寻找一款可用于DAO开发的平台工具， 拥有投票token，propose，投票，on-chain 执行。

作者尝试过用一些现成平台，设想能节省开发时间，复用功能组件，达到开发提速： 例如aragon, Daohaus, Daostack.. colony. 快速比较知名度及用户数后尝试Aragon。 因其文档所述的SDK思路，及delegate contract 升级 及 用户ACL框架中的使用，代理合同控制。

但实际安装及重复简单DEMO程序过程中，深深体会到资料的严重过时，及依赖包彼此之间的的混乱。 同时discord技术支持也很低迷，发帖回帖数目均少， 笔者观察10天没有超过30个帖子。

因此转向业界口碑较好的 Openzeppelin SDK 框架。

https://docs.openzeppelin.com/contracts/4.x/api/governance

本交流也主要基于 is a based on “How to build an on-chain DAO ” by Patrick Collins

Source Code:

https://github.com/yaoting10/openzepplin_governanece_example

### **2 Openzeppelin governance的框架主要结构**

### **2.1 Openzepplin DAO governance 的主体结构是**

governanceToken.sol 投票token合约

governorContract.sol 用于propose，投票流程的合约

timelock.sol  拥有最高权限，最后执行的合约， 包含了grace period, 可以让用户退出。

### **2.2** **使用到的 openzepplin wizard 去定制你的 governanceToken.sol**

https://docs.openzeppelin.com/contracts/4.x/wizard

![img](https://lh6.googleusercontent.com/bTB7pfN6kqvF4nQMNath837Upc3YhgqbPz09M1ExscH3jifiy0wfPwGlA-3C-KiGVq1FwIvkWnRpvLjEX_E8Z_90BRvjAQBl7EuztQa7s_mbnPtJVCgfJsPwLcBZowZnsezMR96J19v-KDqoaqaLaw)

### **2.3 主要合约概述**

Governancetoken.sol 是voting token合同

#### 调入

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

#### 合约声明

contract GovernanceToken is ERC20Votes

#### github

https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20

对比 ERC20, ERC20votes变动地方：

Constructor:

```solidity
contract XXXXToken is ERC20Votes

constructor(){
   ERC20("GovernanceToken", "GT")

   ERC20Permit("GovernanceToken")
}


```

代币本身不是投票权， 投票需要实施代理。 代理后的才是真投票权，可以通过 geVotes, getPastVotes 去查询不同 checkpoint 的voting power，用 checkpoint记录了投票权的记录。 设计原理是为了防止在投票前夕，鲸鱼大量买入，投票结束后大量卖出。

“This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either by calling the {delegate} function directly, or by providing a signature to be used with {delegateBySig}. Voting power can be queried through the public accessors {getVotes} and {getPastVotes}.”

\* By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.

需要注意填入这些 virtual function, 调入 super, 是为了确保设计的 checkpoint 的snapshot 调入正确。



```solidity
function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }
  
  function _mint(address to, uint256 amount) internal override(ERC20Votes) {
    super._mint(to, amount);
  }
  
  function _burn(address account, uint256 amount)
    internal
    override(ERC20Votes)  {
    super._burn(account, amount);
  }
```

**governaorContract.sol， DAO 主流程合同**

```solidity
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";

contract GovernorContract is
  Governor,
  GovernorSettings,
  GovernorCountingSimple,
  GovernorVotes,
  GovernorVotesQuorumFraction,
  GovernorTimelockControl
{
  constructor(
    IVotes _token, // vote token
    TimelockController _timelock, // 执行模块
    uint256 _quorumPercentage, //最少投票比例
    uint256 _votingPeriod, // 投票时长
    uint256 _votingDelay // propose 到 voting 时间
  )
```

**Time lock 执行模块**

```solidity
import "@openzeppelin/contracts/governance/TimelockController.sol";
contract TimeLock is TimelockController {
// minDelay is how long you have to wait before executing
// proposers is the list of addresses that can propose
// executors is the list of addresses that can execute
  constructor(
    uint256 minDelay,
    address[] memory proposers, // 投票建议
    address[] memory executors  // 投票执行
  ) TimelockController(minDelay, proposers, executors) {}

}
```

**3实验步骤:**

**3.1 部署环境**

Environment:

Yarn: 1.22.17

Node: 16.13.1

Hardhat：（JS, TS）

"hardhat-deploy": "^0.11.20",  提供本地节点环境，便于低成本开发

**3.2 测试主要步骤**

首先把所有合约部署后，经过propose, vote, 成功后，用 timelock 去修改一个demo合同（box.sol）的参数

测试环境分为： 本地及goerli测试环境·。 本地虚拟机用 hardhat node 来模拟

**3.2.1部署**

部署 governanceToken

```js
const governanceToken = await deploy("GovernanceToken", {
   。。。
   // wait for confirm
});
// auto verify
await delegate(governanceToken.address, deployer);
```

部署 timeLock

```js
const timeLock = await deploy("TimeLock", {
	。。。
});
```

部署 governorContract

```js
const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: [
      governanceToken.address,
      timeLock.address,
      QUORUM_PERCENTAGE,
      VOTING_PERIOD,
      VOTING_DELAY,
    ],
    log: true,
  })

const proposerRole = await timeLock.PROPOSER_ROLE();
const executorRole = await timeLock.EXECUTOR_ROLE();
const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
// 把proposal role 给到 governor合约
const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
// 把执行权 给到所有人- 纯粹演示作用
const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
// 把ADMIN权限收回- 
const revokeTx = await timeLock.revokeRole(adminRole, deployer);
await revokeTx.wait(1);
```

部署一个DEMO 合同

```js
const box = await deploy("Box", {
	。。。。
});
// 把DEMO合同拥有权给到timelock-
const boxTransferOwnerTx = await boxContract.transferOwnership(timeLock.address);
```

**3.2.2 propose script**

```js
const governor = await ethers.getContract("GovernorContract")
const box = await ethers.getContract("Box")
// 执行合约function及参数要 encode功能 
const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
const proposeTx = await governor.propose(
  [box.address],
  [0],
  [encodedFunctionCall],
  proposalDescription
 )
const proposeReceipt = await proposeTx.wait(1)
const proposalId = proposeReceipt.events[0].args.proposalId
console.log(`Proposed with proposal ID:\n ${proposalId}`)
const proposalState = await governor.state(proposalId)
const proposalSnapShot = await governor.proposalSnapshot(proposalId)
const proposalDeadline = await governor.proposalDeadline(proposalId)
```

**3.2.3 vote script**

```js
const governor = await ethers.getContract("GovernorContract")
const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
const voteTxReceipt = await voteTx.wait(1)
console.log(voteTxReceipt.events[0].args.reason)
```

**ProposalState: pending, active, canceled, defeated, successde, queued, expired, executed.**

**vote type: against, for, abstain**

![img](https://lh6.googleusercontent.com/8WuKffK0KfZwidydneEQ6JgRaFPMCR-rSt5xywrKKett5ND8DbdFGMjtgfwvXFycJDmfArZYxK-7_YuVkvSnZeNI1RPGD8Du4WhV2xZxMOQut7-2uDNoTP8prJC1NG05sejNkZQLkbNu2IX_WRJpwg)

const proposalState = await governor.state(proposalId)

**3.2.4  query , execute script **

```js
 const box = await ethers.getContract("Box")
 const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
 const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
 const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
 const executeTx = await governor.execute(
  [box.address],
  [0],
  [encodedFunctionCall],
  descriptionHash
 )
 await executeTx.wait(1)
 console.log(`Box value: ${await box.retrieve()}`)
```

**3.2.4 一些有用的命令。**

```shell
yarn hardhat node  // create a fake node, cool http://127.0.01:8545, first deploy
// hardhat nde 之后，然后再开一个 terminal, 执行其他命令
yarn hardhat deploy --network localhost // deploy to localhost network

yarn hardhat run scripts/propose.ts --network localhost //run propose script

yarn hardhat run scripts/vote.ts --network localhost

yarn hardhat run scripts/queue-and-execute.ts --network localhost

yarn hardhat console –network localhost // link localhost hardhat console
```



```js
const governor = await ethers.getContract("GovernorContract")
const state = governor.state("PROPOSEID") //input ProposalId
state.toString()	// see propose state

const box = await ethers.getContract("Box")
const value = await box.retrieve()
value.toString()	// see box contract value
```

