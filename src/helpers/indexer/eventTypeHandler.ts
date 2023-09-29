import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";

export const eventTypeHandler = async (event: IBlockchainEvent) => {
    await EventType.findOneAndUpdate(
        { name: event.eventName }, // Filter
        { $setOnInsert: { name: event.eventName } }, // Data to insert if not found
        { upsert: true, new: true } // Options
    );
}