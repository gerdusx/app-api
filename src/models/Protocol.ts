import mongoose from 'mongoose';

export interface IProtocol {
    _id: string;
    address: string;
    chainId: number;
    fork: "Compound" | "Granary";
    name: string;
    decimals: string;
    symbol: string;

}

const protocolSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    fork: String,
    name: String,
    decimals: String,
    symbol: String,
});

const Protocol = mongoose.model<IProtocol>('Protocol', protocolSchema);
export default Protocol;