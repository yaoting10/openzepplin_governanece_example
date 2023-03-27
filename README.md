# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

```shell
yarn hardhat deploy
yarn hardhat node   ## create a fake node, cool  http://127.0.01:8545, first deploy
## hardhat nde 之后，然后再开一个 terminal, 执行其他命令
yarn hardhat run scripts/propose.ts --network localhost

yarn hardhat run scripts/propose.ts --network localhost
yarn hardhat run scripts/vote.ts --network localhost
yarn hardhat run scripts/queue-and-execute.ts --network localhost

yarn hardhat console --network localhost
const governor = await ethers.getContract("GovernorContract")
let state = governor.state("")
const box = await ethers.getContract("Box")

const value = await box.retrieve()
value.toString()

```