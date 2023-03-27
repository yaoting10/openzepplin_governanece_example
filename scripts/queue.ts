import { ethers, network } from "hardhat";
import { FUNC, NEW_STOPRE_VALUE, PROPOSAL_DESCRIPTION,deploymentChains, MIN_DELAY } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTimes } from "../utils/move-times";

export async function queue() {
    const args = [NEW_STOPRE_VALUE]
    const functionToCall = FUNC
    const box =await ethers.getContract("Box")
    const encodeFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    // could also use ethers.utils.id(PROPOSAL)
    const governor = await ethers.getContract("GovernorContract")
    console.log("governor:", governor.address)
    // const timeLock = await ethers.getContract("TimeLock")
    console.log("Queueing...")
    const queueTx = await governor.queue([box.address], [0], [encodeFunctionCall], descriptionHash)
    await queueTx.wait(1)

    if(deploymentChains.includes(network.name)){
        await moveTimes(MIN_DELAY +1)
        await moveBlocks(1)
    }
}
queue()
.then(()=>process.exit(0))
.catch((error) =>{
    console.error(error)
    process.exit(1)
})