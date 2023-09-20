import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vault from './models/Vault';
import { gqlquery } from './queries/query';
var cache = require('memory-cache');
const axios = require('axios');
import cron from 'node-cron';
import Token from './models/Token';
import { ethers } from 'ethers';
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
    res.json("home");
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

            const coinIds = tokens.map(token => token.coinId).join(",");
            let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
            const coinsResponse = await axios.get(coinGeckoQuery);
            const updatedTokens = tokens.map(token => {
                const usdValue = token.coinId ? coinsResponse.data[token.coinId]?.usd : 0;
                return {
                    ...token.toObject(),
                    usd: usdValue
                }
            })

            cache.put('tokens', updatedTokens);

            res.json(updatedTokens)
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

            const dbVaults = await Vault.find();
            const tokens = await Token.find();
            const coinIds = tokens.map(token => token.coinId).join(",");
            let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
            const coinsResponse = (await axios.get(coinGeckoQuery)).data;
            const updatedTokens = tokens.map(token => {
                const usdValue = token.coinId ? coinsResponse[token.coinId]?.usd : 0;
                return {
                    ...token.toObject(),
                    usd: usdValue
                }
            })

            const vaults = response.data.data.Vaults.filter((vault: any) =>
                dbVaults.some(dbVault =>
                    vault.address.toLowerCase() === dbVault.address?.toLowerCase() && vault.chain.chainId === dbVault.chainId
                ));

            const snapshots = response.data.data.VaultSnapshots.map((snapshot: any) => {

                const vault = vaults.find((x: any) => x.address.toLowerCase() === snapshot.vaultAddress.toLowerCase());
                const reaperToken = updatedTokens.find((x: any) => x.address.toLowerCase() === vault?.token?.toLowerCase());

                let usdValues = {
                    usd: {
                        tvl: 0
                    }
                }

                if (reaperToken) {
                    const totalAllocatedUnits = ethers.formatUnits(snapshot.totalAllocated, vault.decimals);
                    const totalIdleUnits = ethers.formatUnits(snapshot.totalIdle, vault.decimals);

                    const balance = Number(totalAllocatedUnits) + Number(totalIdleUnits);
                    usdValues.usd.tvl = balance * reaperToken.usd;
                }

                return {
                    ...snapshot,
                    usd: usdValues.usd
                }
            });

            const data = {
                Chains: response.data.data.Chains,
                Users: response.data.data.Users,
                Strategys: response.data.data.Strategys,
                Vaults: vaults,
                VaultSnapshots: snapshots,
                StrategyReports: response.data.data.StrategyReports,
                VaultTransactions: response.data.data.VaultTransactions
            }

            cache.put('data', {
                data,
                expires: expirationTimestamp,
                lastFetch
            });

            const resp = {
                source: "api",
                data,
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
        const dbVaults = await Vault.find();
        cache.put('vaults', dbVaults);

        const tokens = await Token.find();
        const coinIds: string = tokens.map(token => token.coinId).join(",");
        let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
        const coinsResponse = (await axios.get(coinGeckoQuery)).data;
        const updatedTokens = tokens.map(token => {
            const usdValue = token.coinId ? coinsResponse[token.coinId]?.usd : 0;
            return {
                ...token.toObject(),
                usd: usdValue
            }
        })

        cache.put('tokens', updatedTokens);

        const response = await axios.post(graphqlEndpoint, {
            query: gqlquery
        });

        const vaults = response.data.data.Vaults.filter((vault: any) =>
            dbVaults.some(dbVault =>
                vault.address.toLowerCase() === dbVault.address?.toLowerCase() && vault.chain.chainId === dbVault.chainId
            ));

        const snapshots = response.data.data.VaultSnapshots.map((snapshot: any) => {

            const vault = vaults.find((x: any) => x.address.toLowerCase() === snapshot.vaultAddress.toLowerCase());
            const reaperToken = updatedTokens.find((x: any) => x.address.toLowerCase() === vault?.token?.toLowerCase());

            let usdValues = {
                usd: {
                    tvl: 0
                }
            }

            if (reaperToken) {
                const totalAllocatedUnits = ethers.formatUnits(snapshot.totalAllocated, vault.decimals);
                const totalIdleUnits = ethers.formatUnits(snapshot.totalIdle, vault.decimals);

                const balance = Number(totalAllocatedUnits) + Number(totalIdleUnits);
                usdValues.usd.tvl = balance * reaperToken.usd;
            }

            return {
                ...snapshot,
                usd: usdValues.usd
            }
        });

        const data = {
            Chains: response.data.data.Chains,
            Users: response.data.data.Users,
            Strategys: response.data.data.Strategys,
            Vaults: vaults,
            VaultSnapshots: snapshots,
            StrategyReports: response.data.data.StrategyReports,
            VaultTransactions: response.data.data.VaultTransactions
        }

        const expirationTimestamp = Date.now() + 600000; // Set to expire in 30 seconds
        const lastFetch = Date.now();

        cache.put('data', {
            data,
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
