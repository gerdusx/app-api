import mongoose from 'mongoose';

export interface IStrategyReport {
    _id: string;
    hash: string;
    chainId: number;
    strategyAddress: string;
    vaultAddress: string;
    reportDate?: number;
    gain: string;
    loss: string;
    debtPaid: string;
    gains: string;
    losses: string;
    allocated: string;
    allocationAdded: string;
    allocBPS: string;
    duration: number;
}

const strategyReportSchema = new mongoose.Schema({
    hash: String,
    chainId: Number,
    strategyAddress: String,
    vaultAddress: String,
    reportDate: Number,
    gain: String,
    loss: String,
    debtPaid: String,
    gains: String,
    losses: String,
    allocated: String,
    allocationAdded: String,
    allocBPS: String,
    duration: Number,
});

strategyReportSchema.index({ reportDate: 1, strategyAddress: 1, hash: 1 });

const StrategyReport = mongoose.model<IStrategyReport>('StrategyReport', strategyReportSchema);
export default StrategyReport;