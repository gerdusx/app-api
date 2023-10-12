import mongoose from 'mongoose';

export interface IVault {
    address: string,
    chainId: number,
    startingBlock?: number,
    dataFetched?: boolean,
    name?: string;
    symbol?: string;
    asset?: string;
    constructionTime?: number;
    token?: string;
    decimals?: number;
}

const VaultSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    startingBlock: Number,
    dataFetched: Boolean,
    name: String,
    symbol: String,
    asset: String,
    constructionTime: Number,
    token: String,
    decimals: Number,
});

const Vault = mongoose.model<IVault>('Vault', VaultSchema);
export default Vault;