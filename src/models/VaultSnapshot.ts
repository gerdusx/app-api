import mongoose, { Document } from 'mongoose';

export interface IVaultSnapshot {
  timestamp: number,
  lastBlockTimestamp: number,
  vaultAddress: string;
  totalIdle: string;
  totalAllocated: string;
  chainId: number;
  pricePerFullShare: string;
  lockedProfit: string;
  totalAllocBPS: string;
  totalAssets: string;
  totalSupply: string;
  tvlCap: string;
}


const vaultSnapshotSchema = new mongoose.Schema({
  timestamp: { type: Number, index: true },
  lastBlockTimestamp: Number,
  vaultAddress: { type: String, index: true },
  totalIdle: String,
  totalAllocated: String,
  chainId: Number,
  pricePerFullShare: String,
  lockedProfit: String,
  totalAllocBPS: String,
  totalAssets: String,
  totalSupply: String,
  tvlCap: String,
});

export const VaultSnapshot = mongoose.model<IVaultSnapshot>('VaultSnapshot', vaultSnapshotSchema);