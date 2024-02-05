import mongoose from 'mongoose';

export interface IStrategy {
    _id: string;
    block: number;
    address: string;
    chainId: number;
    vaultAddress: string;
    dateAdded?: number;
    feeBPS: string;
    allocBPS: string;
    protocolAddress?: string;
    granary?: GranaryData;
}

export interface GranaryData {
    userReserveData?: GranaryUserReserveData;
}

export interface GranaryUserReserveData {
    currentATokenBalance: string;
    currentStableDebt: string;
    currentVariableDebt: string;
    principalStableDebt: string;
    scaledVariableDebt: string;
    stableBorrowRate: string;
    liquidityRate: string;
    stableRateLastUpdated: string;
    usageAsCollateralEnabled: boolean;
}

const granaryUserReserveDataSchema = new mongoose.Schema({
    currentATokenBalance: String,
    currentStableDebt: String,
    currentVariableDebt: String,
    principalStableDebt: String,
    scaledVariableDebt: String,
    stableBorrowRate: String,
    liquidityRate: String,
    stableRateLastUpdated: String,
    usageAsCollateralEnabled: Boolean
});

const granaryDataSchema = new mongoose.Schema({
    userReserveData: granaryUserReserveDataSchema
});

const strategySchema = new mongoose.Schema({
    block: Number,
    address: String,
    chainId: Number,
    vaultAddress: String,
    dateAdded: Number,
    feeBPS: String,
    allocBPS: String,
    protocolAddress: String,
    granary: granaryDataSchema
});

const Strategy = mongoose.model<IStrategy>('Strategy', strategySchema);
export default Strategy;