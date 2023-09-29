import mongoose, { Document } from 'mongoose';

export interface IEventType {
    name:string,
  }

const eventTypeSchema = new mongoose.Schema({
  name: String
});

export const EventType = mongoose.model<IEventType>('EventType', eventTypeSchema);