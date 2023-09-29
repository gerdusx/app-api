import { ethers } from "ethers";
import dotenv from 'dotenv';
dotenv.config();

export const getProviderByChain = (chainId: number) => {
    switch (chainId) {
        case 10:
            return new ethers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL);
    
        default:
            return null
    }
}