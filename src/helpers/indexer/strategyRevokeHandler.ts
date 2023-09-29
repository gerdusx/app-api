import { ethers } from "ethers";
import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";
import { VAULT_V2_ABI } from "../../abi/vaultV2Abi";
import { getProviderByChain } from "../getProviderByChain";
import Vault, { IVault } from "../../models/Vault";
import { getEventParams } from "../getEventParams";
import Strategy, { IStrategy } from "../../models/Strategy";
import { IStrategyAddedEvent } from "../../interfaces/events/IStrategyAddedEvent";
import { IStrategyRevokedEvent } from "../../interfaces/events/IStrategyRevokedEvent";

export const strategyRevokeHandler = async (event: IBlockchainEvent) => {
    try {
        const params = getEventParams(event) as IStrategyRevokedEvent;

        if (!params?.strategy) {
            console.error("Strategy address missing in the event parameters.");
            return;
        }

        const strategy = await Strategy.findOne({
            address: params.strategy,
            vaultAddress: event.contractAddress
        });

        if (strategy) {
            strategy.allocBPS = "0"

            await strategy.save();
        }

    } catch (error) {
        console.error("Error in addStrategyHandler:", error);
    }

}