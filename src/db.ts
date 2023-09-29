import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongo_uri = process.env.MONGODB_URI;
const mongo_password = process.env.MONGODB_PASSWORD;

if (!mongo_uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const encodedPassword = encodeURIComponent(mongo_password!);
if (encodedPassword) {
    mongo_uri = mongo_uri.replace("password", encodedPassword);
}


export const connectToDb = async () => {
    try {
        await mongoose.connect(mongo_uri!);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
};
