import mongoose from 'mongoose';

const VaultSchema = new mongoose.Schema({
    address: String,
    chainId: Number,
    startingBlock: Number
});

const Vault = mongoose.model('Vault', VaultSchema);
export default Vault;