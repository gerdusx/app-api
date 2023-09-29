import mongoose, { Document } from 'mongoose';

export interface IBlockchainEvent {
    _id: string;
    blockNumber: number;
    transactionHash:string,
    logIndex: number,
    blockTimestamp: number,
    chainId: number,
    contractAddress: string;
    eventName: string;
    eventSignature: string;
    eventParameters: any;
    eventParametersString: string;
    processed: number;
  }

const blockchainEventSchema = new mongoose.Schema({
  blockNumber: Number,
  transactionHash: { type: String, required: true },
  logIndex: { type: Number, required: true },
  blockTimestamp: { type: Number, required: true },
  chainId: Number,
  contractAddress: String,
  eventName: String,
  eventSignature: String,
  eventParameters: mongoose.Schema.Types.Mixed,
  eventParametersString: String,
  processed: Number
});

// Compound index to ensure that the combination of transactionHash and logIndex is unique
blockchainEventSchema.index({ transactionHash: 1, logIndex: 1, eventParametersString: 1 });
blockchainEventSchema.index({ processed: 1, blockTimestamp: 1, logIndex: 1 });


export const BlockchainEvent = mongoose.model<IBlockchainEvent>('BlockchainEvent', blockchainEventSchema);