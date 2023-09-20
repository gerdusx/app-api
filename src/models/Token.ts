import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    name: String,
    image: String,
    coinId: String
});

const Token = mongoose.model('Token', TokenSchema);
export default Token;