import { ethers } from "ethers";
import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";
import { VAULT_V2_ABI } from "../../abi/vaultV2Abi";
import { getProviderByChain } from "../getProviderByChain";
import Vault, { IVault } from "../../models/Vault";
import { getEventParams } from "../getEventParams";
import Strategy, { IStrategy } from "../../models/Strategy";
import { IDepositEvent } from "../../interfaces/events/IDepositEvent";
import { IUser, User } from "../../models/User";

export const depositHandler = async (event: IBlockchainEvent) => {
    try {
        const params = getEventParams(event) as IDepositEvent;

        const user = await User.findOne({
            address: params.owner,
            chainId: event.chainId,
            vaultAddress: event.contractAddress.toLowerCase()
        }) as IUser;

        if (!user) {
            const newUser = new User({
                address: params.owner,
                created: event.blockTimestamp,
                chainId: event.chainId,
                vaultAddress: event.contractAddress.toLowerCase()
            });

            await newUser.save();
        }

    } catch (error) {
        console.error("Error in addStrategyHandler:", error);
    }
}