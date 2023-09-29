import { IStrategy } from "../../models/Strategy";
import { IStrategyReport } from "../../models/StrategyReport";
import { IVault } from "../../models/Vault";
import { IVaultSnapshot } from "../../models/VaultSnapshot";
import { IVaultSnapshotDto } from "./IVaultSnapshotDto";

export interface IStrategyDto extends IStrategy {
    lastReport: IStrategyReport;
    aprReports: IStrategyReport[];
    isActive?: boolean;
}