import * as fs from "fs"
import { ethers, network } from "hardhat";
import {deploymentChains, proposalFile, VOTING_PERIOD} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks";

async function main(){
    const proposalId = JSON.parse(fs.readFileSync(proposalFile, "utf-8")).proposalId
    console.log(`proposalId: ${proposalId}`)
    const voteWay = 1
    const reason = "I like 77"
    await vote(proposalId, voteWay, reason);
}

export async function vote(proposalId: string, voteWay: number, reason: string) {
    console.log("voting...")
    const governor = await ethers.getContract("GovernorContract")
    const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
    const voteTxReceipt = await voteTx.wait(1)
    console.log(voteTxReceipt.events[0].args.reason)
    const proposalState = await governor.state(proposalId)
    console.log(`current proposal state: ${proposalState}`)
    if (deploymentChains.includes(network.name)){
        moveBlocks(VOTING_PERIOD + 1)
    }
}

main()