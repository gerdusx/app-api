import axios from 'axios';
import Token from './models/Token';
import Vault from './models/Vault';
import { ethers } from 'ethers';
import { gqlquery } from './queries/query';
var cache = require('memory-cache');
const graphqlEndpoint = 'https://data.staging.arkiver.net/gerdusx/reaperv3/graphql';
import express, { Request, Response } from 'express';
import { BlockchainEvent, IBlockchainEvent } from './models/BlockchainEvent';
import { IProcessedBlock, ProcessedBlock } from './models/ProcessedBlock';
import { IVaultSnapshot, VaultSnapshot } from './models/VaultSnapshot';
import { updateVaultSnapshotsTotalUsers, updateVaultsnapshots } from './helpers/processing/vaultSnapshot';
import { eventMain } from './helpers/indexer/eventMain';
import Strategy from './models/Strategy';
import StrategyReport from './models/StrategyReport';
const fs = require('fs');

export const getUpdatedTokens = async () => {
    const tokens = await Token.find();
    const coinIds = tokens.map(token => token.coinId).join(",");
    let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
    const coinsResponse = await axios.get(coinGeckoQuery);
    const updatedTokens:any = tokens.map(token => {
        const usdValue = token.coinId ? coinsResponse.data[token.coinId]?.usd : 0;
        return {
            ...token.toObject(),
            usd: usdValue
        }
    });

    return updatedTokens;
};

export const getFilteredVaultsAndSnapshots = async (response: any, updatedTokens: any) => {
    const dbVaults = await Vault.find();
    const vaults = response.data.data.Vaults.filter((vault: any) =>
        dbVaults.some(dbVault =>
            vault.address.toLowerCase() === dbVault.address?.toLowerCase() && vault.chain.chainId === dbVault.chainId
        ));

    const snapshots = response.data.data.VaultSnapshots.map((snapshot: any) => {
        const vault = vaults.find((x: any) => x.address.toLowerCase() === snapshot.vaultAddress.toLowerCase());
        const reaperToken = updatedTokens.find((x: any) => x.address.toLowerCase() === vault?.token?.toLowerCase());

        let usdValues = {
            usd: {
                tvl: 0,
                totalAllocated: 0,
                totalIdle: 0
            }
        };

        if (reaperToken) {
            const totalAllocatedUnits = ethers.formatUnits(snapshot.totalAllocated, vault.decimals);
            const totalIdleUnits = ethers.formatUnits(snapshot.totalIdle, vault.decimals);

            const balance = Number(totalAllocatedUnits) + Number(totalIdleUnits);
            usdValues.usd.tvl = balance * reaperToken.usd;
            usdValues.usd.totalAllocated = Number(totalAllocatedUnits) * reaperToken.usd;
            usdValues.usd.totalIdle = Number(totalIdleUnits) * reaperToken.usd;
        }

        return {
            ...snapshot,
            usd: usdValues.usd
        }
    });



    return { vaults, snapshots };
};

export const updateCacheData = async () => {
    const dbVaults = await Vault.find();
    cache.put('vaults', dbVaults);

    const updatedTokens = await getUpdatedTokens();
    cache.put('tokens', updatedTokens);

    const response = await axios.post(graphqlEndpoint, {
        query: gqlquery
    });

    let { vaults, snapshots } = await getFilteredVaultsAndSnapshots(response, updatedTokens);
    snapshots = await updateVaultsnapshots(snapshots);

    const data = {
        Chains: response.data.data.Chains,
        Users: response.data.data.Users,
        Strategys: response.data.data.Strategys,
        Vaults: vaults,
        VaultSnapshots: snapshots,
        StrategyReports: response.data.data.StrategyReports,
        VaultTransactions: response.data.data.VaultTransactions
    };

    const expirationTimestamp = Date.now() + 300000; // Set to expire in 5 minutes

    cache.put('data', {
        data,
        expires: expirationTimestamp,
        lastFetch: Date.now()
    });

    return data;
};

export const fetchVaultsFromCacheOrDb = async (): Promise<any[]> => {
    const vaultsRes = cache.get('vaults');
    if (!vaultsRes) {
        const vaults = await Vault.find();
        cache.put('vaults', vaults);
        return vaults;
    } else {
        return vaultsRes;
    }
};

export const fetchVaultsWithCache = async (req: Request, res: Response) => {
    try {
        const vaults = await fetchVaultsFromCacheOrDb();
        res.json(vaults);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

export const fetchTokensWithCache = async (req: Request, res: Response) => {
    try {
        const tokensRes = cache.get('tokens');
        if (!tokensRes) {
            const updatedTokens = await getUpdatedTokens();
            cache.put('tokens', updatedTokens);
            res.json(updatedTokens)
        } else {
            res.json(tokensRes);
        }
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

export const fetchArkiverDataWithCache = async (req: Request, res: Response) => {
    try {
        const dataCache = cache.get('data');
        if (!dataCache || Date.now() > dataCache.expires) {
            const data = await updateCacheData();
            const expirationTimestamp = Date.now() + 600000; // Set to expire in 30 seconds
            const lastFetch = Date.now();

            const resp = {
                source: "api",
                data,
                expires: expirationTimestamp,
                lastFetch
            }
            res.json(resp);
        } else {
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
};

export const backup = async (req: Request, res: Response) => {
    try {
        const response = await axios.post(graphqlEndpoint, {
            query: gqlquery
        });


        //const data = await Vault.find();

        const jsonData = JSON.stringify(response.data.data.Strategys, null, 2); // The "2" here formats the JSON with 2-space indentation
        fs.writeFileSync('strategies.json', jsonData);

        res.json(jsonData)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GraphQL server.' });
    }
};

export const restoreBackup = async (req: Request, res: Response) => {
    try {
        // Read the JSON file
        const jsonData = fs.readFileSync('strategyReports.json', 'utf8');

        // Parse the JSON string to an array of objects
        const events = JSON.parse(jsonData);

        // Insert the documents into MongoDB
        await StrategyReport.insertMany(events);

        res.json({ message: 'Data restored successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const processEvents = async (req: Request, res: Response) => {
    try {
        const newEvents: IBlockchainEvent[] = await BlockchainEvent.find({processed: { $exists: false }, eventName: "StrategyReported"})
                    .sort({ blockTimestamp: 1, logIndex: 1 })
                    .exec();


        for (let index = 0; index < newEvents.length; index++) {
            const event = newEvents[index];

            if (event) {
                await eventMain(event);
            }
        }

        res.json("Events processed");
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};


export const fetchBlockChainEventsWithCache = async (): Promise<IBlockchainEvent[]> => {
    try {
        const blockchainEventsRes = cache.get('blockchainEvents');
        if (!blockchainEventsRes) {
            const blockchainEvents = await BlockchainEvent.find();
            cache.put('blockchainEvents', blockchainEvents);
            return blockchainEvents
        } else {
            return blockchainEventsRes;
        }
    } catch (error) {
        return [];
    }
};

export const addBlockChainEventsToCache = async (newEvents: any[]) => {
    try {
        const blockchainEventsCache = await fetchBlockChainEventsWithCache();
        if (blockchainEventsCache?.length === 0) {
            const blockchainEvents = await BlockchainEvent.find();
            cache.put('blockchainEvents', blockchainEvents);
            return blockchainEvents
        } else {
            const updatedCache = [...blockchainEventsCache, ...newEvents];
            cache.put('blockchainEvents', updatedCache);
        }
    } catch (error) {
        return [];
    }
};

export const getLatestProcessedBlock = async (chainId: number, handler: "event" | "block"): Promise<IProcessedBlock> => {
    return await ProcessedBlock.findOne({ chainId, handler }) as IProcessedBlock;
}

export const updateLatestProcessedBlock = async (chainId: number, blockNumber: number, handler: string) => {
    return await ProcessedBlock.findOneAndUpdate(
        { chainId: chainId, handler: handler },
        {
            $set: {
                latestBlock: blockNumber
            }
        },
        {
            upsert: true, // If an entry for the chainId doesn't exist, create a new one.
            new: true     // Return the updated document.
        }
    );
}


export const fetchVaultSnapshotsWithCache = async (): Promise<IVaultSnapshot[]> => {
    try {
        const snapshotsCache = cache.get('vaultSnapshots');
        if (!snapshotsCache) {
            const vaultSnapshots = await VaultSnapshot.find();
            cache.put('vaultSnapshots', vaultSnapshots);
            return vaultSnapshots
        } else {
            return snapshotsCache;
        }
    } catch (error) {
        return [];
    }
};