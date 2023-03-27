import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


const deployBox:DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    log("deploying box...")

    const box =await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        // wait for confirm
    })

    const boxContract = await ethers.getContractAt("Box", box.address);
    const boxSetTx = await boxContract.store(10)
    await boxSetTx.wait(1)
    const boxVal = await boxContract.retrieve();

    const timeLock = await ethers.getContract("TimeLock");
    // const timeLock = await ethers.getContract("GovernorContract");
    const boxTransferOwnerTx = await boxContract.transferOwnership(timeLock.address);
    await boxTransferOwnerTx.wait(1);
    console.log("box contract deployed, the value", boxVal.toString());
}

export default deployBox;