import mongoose from 'mongoose';
import { ISnapshot_Delta } from '../interfaces/dto/IVaultSnapshotDto';

export interface IChain {
    _id: string;
    chainId: number;
    etherscanUrl: string;
    name?: string;
    active: boolean;
    last30SnapShots?: { timestamp: number; tvl: number; totalUsers: number }[];
    lastSnapShotDelta?: {
        tvl?: ISnapshot_Delta;
        totalUsers?: ISnapshot_Delta;
    };
}

const chainSchema = new mongoose.Schema({
    chainId: Number,
    name: String,
    etherscanUrl: String,
    active: Boolean
});

const Chain = mongoose.model<IChain>('Chain', chainSchema);
export default Chain;