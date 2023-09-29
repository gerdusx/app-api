import mongoose from 'mongoose';

export interface IProcessedBlock {
  chainId: number;
  latestBlock: number;
  blocksToFetch: number;
  handler: string;
  blockInterval: number;
}

const processedBlockSchema = new mongoose.Schema({
  chainId: Number, // To differentiate if you're indexing multiple chains in the future.
  latestBlock: Number,
  blocksToFetch: Number,
  handler: String,
  blockInterval: Number,
});

export const ProcessedBlock = mongoose.model('ProcessedBlock', processedBlockSchema);