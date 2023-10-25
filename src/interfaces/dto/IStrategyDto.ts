import { IProtocol } from "../../models/Protocol";
import { IStrategy } from "../../models/Strategy";
import { IStrategyReport } from "../../models/StrategyReport";
import { IVault } from "../../models/Vault";
import { IVaultSnapshot } from "../../models/VaultSnapshot";
import { IVaultSnapshotDto } from "./IVaultSnapshotDto";

export interface IStrategyDto extends IStrategy {
    lastReport: IStrategyReport;
    aprReports: IStrategyReport[];
    isActive?: boolean;
    last30daysHarvests?: IStrategyHarvestLast30Days[],
    last30daysHarvestProfit?: number,
    protocol?: IProtocol
}

export interface IStrategyHarvestLast30Days {
    timestamp: number;
    accumulatedGain?: string;
    accumulatedGainValue?: number;
}
