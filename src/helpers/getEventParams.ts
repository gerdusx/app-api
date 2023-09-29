import Long from 'long';
import { IDepositEvent } from "../interfaces/events/IDepositEvent";
import { IStrategyAddedEvent } from "../interfaces/events/IStrategyAddedEvent";
import { IStrategyReportedEvent } from "../interfaces/events/IStrategyReportedEvent";
import { IBlockchainEvent } from "../models/BlockchainEvent";
import { updateVaultHandler } from './indexer/updateVaultHandler';
import { IStrategyAllocBPSUpdatedEvent } from '../interfaces/events/IStrategyAllocBPSUpdatedEvent';
import { IStrategyRevokedEvent } from '../interfaces/events/IStrategyRevokedEvent';

export const getEventParams = (ev: IBlockchainEvent) => {
    const params = ev.eventParametersString.split(",");

    switch (ev.eventName) {
        case "Deposit": {
            const event: IDepositEvent = {
                sender: params[0],
                owner: params[1],
                assets: params[2],
                shares: params[3],
                blockTimestamp: ev.blockTimestamp,
                chainId: ev.chainId,
                vaultAddress: ev.contractAddress
            }

            return event
        }

        case "RoleGranted": {
            updateVaultHandler(ev);
            break;
        }
        case "StrategyAdded": {
            const event: IStrategyAddedEvent = {
                strategy: params[0],
                feeBPS: params[1],
                allocBPS: params[2]
            }

            return event
        }
        case "StrategyRevoked": {
            const event: IStrategyRevokedEvent = {
                strategy: params[0],
            }

            return event
        }
        case "StrategyAllocBPSUpdated": {
            const event: IStrategyAllocBPSUpdatedEvent = {
                strategy: params[0],
                allocBPS: params[1]
            }

            return event
        }
        case "StrategyReported": {
            const event: IStrategyReportedEvent = {
                strategy: params[0].toString(),
                gain: params[1],
                loss: params[2],
                debtPaid: params[3],
                gains: params[4],
                losses: params[5],
                allocated: params[6],
                allocationAdded: params[7],
                allocBPS: params[8]
            }

            return event
        }
    
        default:
            break;
    }
}

// function longObjectToString(input: any) {
//     if (typeof input === 'object' && 'high' in input && 'low' in input) {
//         const value = new Long(input.low, input.high, input.unsigned || false);
//         return value.toString();
//     } else if (input === "0" || typeof input === 'string') {
//         return input;
//     }  else if (typeof input === 'number') {
//         return input.toString();
//     }
// }