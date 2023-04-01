import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {VOTING_DELAY, VOTING_PERIOD, QUORUM_PENCENTAGE, ADDRESS_ZERO} from "../helper-hardhat-config";
import {ethers} from "hardhat";

const deployGovernorConstract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log, get} =deployments;
    const { deployer } = await getNamedAccounts();

    const governanceToken = await get("GovernanceToken");
    const timeLock = await ethers.getContract("TimeLock")
    log("deploying... GovernorContract")
    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [
            governanceToken.address,
            timeLock.address,
            QUORUM_PENCENTAGE,
            VOTING_PERIOD,
            VOTING_DELAY,
        ],
        log: true,
        // wait for confirm  
    })
    // auto verify

    console.log(`governorContract: ${governorContract.address}`)

    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
    // 把proposal role 给到 governor合约
    const proposerTx = await timeLock.grantRole(proposerRole, governorContract.address);
    // 把执行权 给到所有人- 纯粹演示作用
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
    // 把ADMIN权限收回-
    const revokeTx = await timeLock.revokeRole(adminRole, deployer);
    await revokeTx.wait(1);

}

export default deployGovernorConstract;