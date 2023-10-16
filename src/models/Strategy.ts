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
}

const strategySchema = new mongoose.Schema({
    block: Number,
    address: String,
    chainId: Number,
    vaultAddress: String,
    dateAdded: Number,
    feeBPS: String,
    allocBPS: String,
    protocolAddress: String
});

const Strategy = mongoose.model<IStrategy>('Strategy', strategySchema);
export default Strategy;