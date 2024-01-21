import mongoose from 'mongoose';

export interface IToken {
    _id?: mongoose.Types.ObjectId;
    address: string;
    chainId: number;
    name: string;
    image: string;
    coinId: string;
    usd: number;
    usdLastUpdated?: number;
}

const TokenSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    name: String,
    image: String,
    coinId: String,
    usd: Number,
    usdLastUpdated: Number,
});

const Token = mongoose.model('Token', TokenSchema);
export default Token;