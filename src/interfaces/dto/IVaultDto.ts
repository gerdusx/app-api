import { IToken } from "../../models/Token";
import { IVault } from "../../models/Vault";
import { IVaultSnapshot } from "../../models/VaultSnapshot";
import { IStrategyDto } from "./IStrategyDto";
import { IVaultSnapshotDto } from "./IVaultSnapshotDto";

export interface IVaultDto extends IVault {
    tokenDto?: IToken;
    strategies: IStrategyDto[];
    lastSnapShot: IVaultSnapshotDto;
    last30SnapShots: IVaultSnapshotDto[];
    last30daysHarvestProfit?: number,
}