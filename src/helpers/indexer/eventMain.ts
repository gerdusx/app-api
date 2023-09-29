import { BlockchainEvent, IBlockchainEvent } from "../../models/BlockchainEvent";
import { addStrategyHandler } from "./addStrategyHandler";
import { depositHandler } from "./depositHandler";
import { eventTypeHandler } from "./eventTypeHandler";
import { strategyAllocBPSUpdatedHandler } from "./strategyAllocBPSUpdatedHandler";
import { strategyReportedHandler } from "./strategyReportedHandler";
import { strategyRevokeHandler } from "./strategyRevokeHandler";
import { updateVaultHandler } from "./updateVaultHandler";

export const eventMain = async (event: IBlockchainEvent) => {
    console.log(`processing ${event.eventName} - ${event.contractAddress} - ${event.blockNumber}`)
    await eventTypeHandler(event);

    switch (event.eventName) {
        case "Deposit": {
            depositHandler(event);
            break;
        }

        case "RoleGranted": {
            updateVaultHandler(event);
            break;
        }
        
        case "StrategyAdded": {
            addStrategyHandler(event);
            break;
        }

        case "StrategyRevoked": {
            strategyRevokeHandler(event);
            break;
        }

        case "StrategyAllocBPSUpdated": {
            strategyAllocBPSUpdatedHandler(event);
            break;
        }

        case "StrategyReported": {
            strategyReportedHandler(event);
            break;
        }
    
        default:
            break;
    }






    // // Update the processed field to the current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    await BlockchainEvent.updateOne(
        { _id: event._id },  // Filter by the event's ID
        { processed: currentTimestamp } // Set the processed field to current timestamp
    );
}