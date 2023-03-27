import * as fs from "fs";
import { ethers, network } from "hardhat";
import { deploymentChains, FUNC, proposalFile, PROPOSAL_DESCRIPTION, VOTING_DELAY } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

export async function propose(args:any[], functionCall: string, proposalDescription: string) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    const encodeFunctionCall = box.interface.encodeFunctionData(functionCall, args)
    console.log(`proposing ${functionCall} on ${box.address} with ${args}`)
    console.log(`Proposal Description: \n ${proposalDescription}`)
    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodeFunctionCall],
        proposalDescription
    )
    // if working on a development chain, we will push forward till we get to the voting period
    if(deploymentChains.includes(network.name)){
        await moveBlocks(VOTING_DELAY +1)
    }
    const proposeReceipt = await proposeTx.wait(1)
    const proposeId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID: \n ${proposeId}`)

    const proposalState = await governor.state(proposeId)
    const proposalSnapshot = await governor.proposalSnapshot(proposeId)
    const proposalDeadline = await governor.proposalDeadline(proposeId)
    
    storeProposalId(proposeId.toString())
    // save the proposalId
    console.log(`proposalId: ${proposeId}`)

    // The state of the proposal, 1 is not passed, 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapshot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}
propose([77], FUNC, PROPOSAL_DESCRIPTION)



function storeProposalId(proposalId: string){
    let chainId = network.config.chainId
    let stuct = {
        chainId: chainId,
        proposalId: proposalId
    }
    try {
        fs.writeFileSync(proposalFile, JSON.stringify(stuct));
        // file written successfully
      } catch (err) {
        console.error(err);
      }
}

// storeProposalId("51995609256779193927593370038163877388675656647147812694351217508179809059172")
