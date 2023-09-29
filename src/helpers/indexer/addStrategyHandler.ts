import { ethers } from "ethers";
import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";
import { VAULT_V2_ABI } from "../../abi/vaultV2Abi";
import { getProviderByChain } from "../getProviderByChain";
import Vault, { IVault } from "../../models/Vault";
import { getEventParams } from "../getEventParams";
import Strategy, { IStrategy } from "../../models/Strategy";
import { IStrategyAddedEvent } from "../../interfaces/events/IStrategyAddedEvent";

export const addStrategyHandler = async (event: IBlockchainEvent) => {
    try {
        const params = getEventParams(event) as IStrategyAddedEvent;

        if (!params?.strategy) {
            console.error("Strategy address missing in the event parameters.");
            return;
        }

        const strategy = await Strategy.findOne({
            address: params.strategy,
            vaultAddress: event.contractAddress
        }) as IStrategy;

        if (!strategy) {
            // Strategy does not exist, so create a new one
            const newStrategy = new Strategy({
                block: event.blockNumber,
                address: params.strategy,
                chainId: event.chainId,
                vaultAddress: event.contractAddress,
                dateAdded: event.blockTimestamp,
                feeBPS: params.feeBPS,
                allocBPS: params.allocBPS
            });

            await newStrategy.save();
        }

    } catch (error) {
        console.error("Error in addStrategyHandler:", error);
    }

}