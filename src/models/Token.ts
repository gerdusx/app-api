import mongoose from 'mongoose';

export interface IToken {
    address: string;
    chainId: number;
    name: string;
    image: string;
    coinId: string;
    usd: number;
}

const TokenSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    name: String,
    image: String,
    coinId: String
});

const Token = mongoose.model('Token', TokenSchema);
export default Token;