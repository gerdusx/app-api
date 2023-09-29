import { IWithdrawEvent } from "../../../interfaces/events/IWithdrawEvent";
import { fetchBlockChainEventsWithCache } from "../../../utils";

export const getWithdraws = async () => {
    const cachedEvents = await fetchBlockChainEventsWithCache();

    const withdraws = cachedEvents.filter(x => x.eventName === "Withdraw").map(ev => {
        const withdraw: IWithdrawEvent = {
            sender: ev.eventParameters[0],
            receiver: ev.eventParameters[0],
            owner: ev.eventParameters[1],
            assets: ev.eventParameters[2].toString(),
            shares: ev.eventParameters[3].toString(),
            blockTimestamp: ev.blockTimestamp,
            chainId: ev.chainId
        }

        return withdraw;
    });

    return withdraws;
}