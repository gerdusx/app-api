import { ethers } from "ethers";
import { IBlockchainEvent } from "../../models/BlockchainEvent";
import { EventType } from "../../models/EventType";
import { VAULT_V2_ABI } from "../../abi/vaultV2Abi";
import { getProviderByChain } from "../getProviderByChain";
import Vault, { IVault } from "../../models/Vault";
import { getEventParams } from "../getEventParams";
import Strategy, { IStrategy } from "../../models/Strategy";
import { IStrategyAddedEvent } from "../../interfaces/events/IStrategyAddedEvent";
import { IStrategyReportedEvent } from "../../interfaces/events/IStrategyReportedEvent";
import StrategyReport, { IStrategyReport } from "../../models/StrategyReport";

export const strategyReportedHandler = async (event: IBlockchainEvent) => {
    try {
        const params = getEventParams(event) as IStrategyReportedEvent;

        const existingReport = await StrategyReport.findOne({
            reportDate: event.blockTimestamp,
            strategyAddress: params.strategy,
            hash: event.transactionHash
        });

        if (!existingReport) {
            // Get the strategy's last report
            const lastReport = await StrategyReport.findOne({
                strategyAddress: params.strategy
            }).sort({ reportDate: -1 }) as IStrategyReport;

            let duration = 0;

            // If a last report exists, calculate the duration
            if (lastReport && lastReport.reportDate) {
                duration = event.blockTimestamp - lastReport.reportDate;
            } else {
                // If lastReport is not found, get the strategy and use its dateAdded
                const strategy = await Strategy.findOne({
                    address: params.strategy
                }) as IStrategy;

                if (strategy && strategy.dateAdded) {
                    duration = event.blockTimestamp - strategy.dateAdded;
                }
            }

            // Report does not exist, so create a new one
            const newReport = new StrategyReport({
                hash: event.transactionHash,
                chainId: event.chainId,
                strategyAddress: params.strategy,
                vaultAddress: event.contractAddress,
                reportDate: event.blockTimestamp,
                gain: params.gain,
                loss: params.loss,
                debtPaid: params.debtPaid,
                gains: params.gains,
                losses: params.losses,
                allocated: params.allocated,
                allocationAdded: params.allocationAdded,
                allocBPS: params.allocBPS,
                duration // You might need to set this from event or params if it's available
            });

            await newReport.save();
        }

    } catch (error) {
        console.error("Error in strategyReportedHandler:", error);
    }
}