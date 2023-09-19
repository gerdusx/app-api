import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vault from './models/Vault';
import { gqlquery } from './queries/query';
var cache = require('memory-cache');
const axios = require('axios');
import cron from 'node-cron';
import Token from './models/Token';
const cors = require('cors');

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
app.use(cors());
const PORT = 3000;
// cache.put('foo', 'bar');

const graphqlEndpoint = 'https://data.staging.arkiver.net/gerdusx/reaperv3/graphql';

app.get('/', (req, res) => {
    setTimeout(() => {
      res.render('index', { title: 'Hey', message: 'Hello there', date: new Date()})
    }, 5000) //setTimeout was used to simulate a slow processing request
  })

// app.get('/api/vaults', async (req, res) => {
//     try {
//         const vaults = await Vault.find();
//         res.json(vaults);
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// });

app.get('/api/vaults', async (req, res) => {
    try {
        const vaultsRes = cache.get('vaults');
        if (!vaultsRes) {
            const vaults = await Vault.find();
            cache.put('vaults', vaults);

            res.json(vaults)
        } else {
            res.json(vaultsRes);
        }       
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.get('/api/tokens', async (req, res) => {
    try {
        const tokensRes = cache.get('tokens');
        if (!tokensRes) {
            const tokens = await Token.find();
            cache.put('tokens', tokens);

            res.json(tokens)
        } else {
            res.json(tokensRes);
        }       
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

app.get('/api/arkiver/data', async (req, res) => {
    try {
        const dataCache = cache.get('data');
        if (!dataCache || Date.now() > dataCache.expires) {

            const response = await axios.post(graphqlEndpoint, {
                query: gqlquery
            });

            const expirationTimestamp = Date.now() + 600000; // Set to expire in 30 seconds
            const lastFetch = Date.now();

            cache.put('data', {
                data: response.data.data,
                expires: expirationTimestamp,
                lastFetch
            });

            const resp = {
                source: "api",
                data: response.data.data,
                expires: expirationTimestamp,
                lastFetch
            }

            res.json(resp);
        } else {
            console.log("dataCache.lastFetch", dataCache.lastFetch)
            console.log("dataCache.expirationTimestamp", dataCache.expires)
            const resp = {
                source: "cache",
                data: dataCache.data,
                expires: dataCache.expires,
                lastFetch: dataCache.lastFetch
            }
            res.json(resp);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GraphQL server.' });
    }
});

cron.schedule('*/5 * * * *', async () => {
    try {
        const vaults = await Vault.find();
        cache.put('vaults', vaults);

        const tokens = await Token.find();
        cache.put('tokens', tokens);

        const response = await axios.post(graphqlEndpoint, {
            query: gqlquery
        });

        const expirationTimestamp = Date.now() + 600000; // Set to expire in 30 seconds
        const lastFetch = Date.now();

        cache.put('data', {
            data: response.data.data,
            expires: expirationTimestamp,
            lastFetch
        });

        console.log('Data refreshed from GraphQL server.');

    } catch (error) {
        console.error('Failed to fetch data from GraphQL server.', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
