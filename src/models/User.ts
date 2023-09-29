import mongoose, { Document } from 'mongoose';

export interface IUser {
    address:string,
    created: number,
    chainId: number,
    vaultAddress: string
  }

const userSchema = new mongoose.Schema({
  address: String,
  created: Number,
  chainId: Number,
  vaultAddress: String
});

userSchema.index({ address: 1 });
userSchema.index({ created: 1 });

export const User = mongoose.model<IUser>('User', userSchema);