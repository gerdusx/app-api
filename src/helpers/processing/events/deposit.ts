import { IDepositEvent } from "../../../interfaces/events/IDepositEvent";
import { fetchBlockChainEventsWithCache } from "../../../utils";

export const getDeposits = async () => {
    const cachedEvents = await fetchBlockChainEventsWithCache();

    const deposits = cachedEvents.filter(x => x.eventName === "Deposit").map(ev => {
        const deposit: IDepositEvent = {
            sender: ev.eventParameters[0],
            owner: ev.eventParameters[1],
            assets: ev.eventParameters[2].toString(),
            shares: ev.eventParameters[3].toString(),
            blockTimestamp: ev.blockTimestamp,
            chainId: ev.chainId,
            vaultAddress: ev.contractAddress
        }

        return deposit;
    });

    return deposits;
}