import { ethers } from "ethers";
import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";
import { VAULT_V2_ABI } from "../../abi/vaultV2Abi";
import { getProviderByChain } from "../getProviderByChain";
import Vault, { IVault } from "../../models/Vault";

export const updateVaultHandler = async (event: IBlockchainEvent) => {
    try {
        const vault = await Vault.findOne({address: event.contractAddress}) as IVault;
        if (!vault.dataFetched) {
            const provider = getProviderByChain(event.chainId);
    
            const contract = new ethers.Contract(event.contractAddress, VAULT_V2_ABI, provider);
    
            const [name, symbol, asset, constructionTime, token, decimals] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.asset(),
                contract.constructionTime(),
                contract.token(),
                contract.decimals()
            ]);
    
            // Update the vault with fetched values
            await Vault.updateOne(
                { address: event.contractAddress },
                {
                    $set: {
                        name: name,
                        symbol: symbol,
                        asset: asset,
                        constructionTime: Number(constructionTime),
                        token: token,
                        decimals: Number(decimals),
                        dataFetched: true
                    }
                }
            );
        }
    } catch (error) {
        console.error("Error in updateVaultHandler:", error);
    }

}