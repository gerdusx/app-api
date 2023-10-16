import mongoose from 'mongoose';

export interface IProtocol {
    _id: string;
    address: string;
    chainId: number;
    fork: "Compound";
}

const protocolSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    fork: String,
});

const Protocol = mongoose.model<IProtocol>('Protocol', protocolSchema);
export default Protocol;