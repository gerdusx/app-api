import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config();

export const getProviderByChain = (chainId: number) => {
    switch (chainId) {
        case 10:
            return new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL, 10);
            // return new ethers.JsonRpcProvider(process.env.MODE === "DEV" ? process.env.HARDHAT_RPC_URL : process.env.OPTIMISM_RPC_URL, process.env.MODE === "DEV" ? 1337 : 10);
            // return new ethers.JsonRpcProvider("http://127.0.0.1:8545/", 1337);
    
        default:
            return null
    }
}