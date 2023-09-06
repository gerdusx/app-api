import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vault from './models/Vault';

dotenv.config();

let mongo_uri = process.env.MONGODB_URI;
const mongo_password = process.env.MONGODB_PASSWORD;

if (!mongo_uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const encodedPassword = encodeURIComponent(mongo_password!);
mongo_uri = mongo_uri.replace("password", encodedPassword);

mongoose.connect(mongo_uri).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!');
});

app.get('/api/vaults', async (req, res) => {
    try {
        const vaults = await Vault.find();
        res.json(vaults);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
