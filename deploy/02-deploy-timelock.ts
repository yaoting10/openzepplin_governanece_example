import {HardhatRuntimeEnvironment} from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {MIN_DELAY} from "../helper-hardhat-config"

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts();

    log("deploying timelock");
    const timelock = await deploy("TimeLock", {
        from: deployer,
        args: [MIN_DELAY, [], [], deployer],
        log: true
        // wait for confirm
    });
    // auto verify
}
export default deployTimeLock;