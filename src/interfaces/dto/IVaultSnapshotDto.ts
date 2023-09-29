import { IVaultSnapshot } from "../../models/VaultSnapshot";

export interface IVaultSnapshotDto extends IVaultSnapshot {
    users?: {
        totalUsers: number
    },
    usd?: {
        tvl: number,
        totalAllocated: number,
        totalIdle: number,
    },
    deltas?: {
        tvl?: ISnapshot_Delta,
        totalUsers?: ISnapshot_Delta
    }
}

export interface ISnapshot_Delta {
    diff?: {
        days1?: number;
        days7?: number;
        days30?: number;
    },
    perc?: {
        days1?: number;
        days7?: number;
        days30?: number;
    }
}