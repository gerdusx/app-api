import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config();

export const getProviderByChain = (chainId: number) => {
    switch (chainId) {
        case 10:
            return new ethers.JsonRpcProvider(process.env.MODE === "DEV" ? process.env.HARDHAT_RPC_URL : process.env.OPTIMISM_RPC_URL, process.env.MODE === "DEV" ? 1337 : 10);
        case 250:
            return new ethers.JsonRpcProvider(process.env.FANTOM_RPC_URL, 250);
        case 42161:
            return new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL, 42161);

        default:
            return null
    }
}