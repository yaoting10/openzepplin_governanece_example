import { network } from "hardhat";

export async function moveBlocks(num: number){
    for(var i=0; i<num; i++){
        // await network.provider.send("evm_mine");
        await network.provider.request({
            method: "evm_mine",
            params: []
        })
    }
    console.log(`Moved ${num} blocks`)
}