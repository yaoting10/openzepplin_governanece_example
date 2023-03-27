import { network } from "hardhat";

export async function moveTimes(amount: number) {
    console.log("Moving blocks...")
    await network.provider.send("evm_increaseTime", [amount])
    console.log(`Moved forward in time ${amount} second`)
}