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
import Chain from './models/Chain';
import { EventType } from './models/EventType';
import { User } from './models/User';
import Protocol from './models/Protocol';
const fs = require('fs');

export const getUpdatedTokens = async () => {
    const tokens = await Token.find();
    const coinIds = tokens.map(token => token.coinId).join(",");
    let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
    const coinsResponse = await axios.get(coinGeckoQuery);
    const updatedTokens: any = tokens.map(token => {
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
        const events = await BlockchainEvent.find();
        const chains = await Chain.find();
        const eventtypes = await EventType.find();
        const blocks = await ProcessedBlock.find();
        const strategies = await Strategy.find();
        const reports = await StrategyReport.find();
        const tokens = await Token.find();
        const users = await User.find();
        const vaults = await Vault.find();
        const snapshots = await VaultSnapshot.find();
        const protocols = await Protocol.find();

        const eventsJson = JSON.stringify(events, null, 2);
        fs.writeFileSync('backups/events.json', eventsJson);

        const chainsJson = JSON.stringify(chains, null, 2);
        fs.writeFileSync('backups/chains.json', chainsJson);

        const eventtypesJson = JSON.stringify(eventtypes, null, 2);
        fs.writeFileSync('backups/eventtypes.json', eventtypesJson);

        const blocksJson = JSON.stringify(blocks, null, 2);
        fs.writeFileSync('backups/blocks.json', blocksJson);

        const strategiesJson = JSON.stringify(strategies, null, 2);
        fs.writeFileSync('backups/strategies.json', strategiesJson);

        const reportsJson = JSON.stringify(reports, null, 2);
        fs.writeFileSync('backups/reports.json', reportsJson);

        const tokensJson = JSON.stringify(tokens, null, 2);
        fs.writeFileSync('backups/tokens.json', tokensJson);

        const usersJson = JSON.stringify(users, null, 2);
        fs.writeFileSync('backups/users.json', usersJson);

        const vaultsJson = JSON.stringify(vaults, null, 2);
        fs.writeFileSync('backups/vaults.json', vaultsJson);

        const snapshotsJson = JSON.stringify(snapshots, null, 2);
        fs.writeFileSync('backups/snapshots.json', snapshotsJson);

        const protocolsJson = JSON.stringify(protocols, null, 2);
        fs.writeFileSync('backups/protocols.json', protocolsJson);

        res.json("done")
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GraphQL server.' });
    }
};

export const restoreBackup = async (req: Request, res: Response) => {
    try {
        const eventsJson = fs.readFileSync('backups/events.json', 'utf8');
        const events = JSON.parse(eventsJson);
        await BlockchainEvent.insertMany(events);

        const chainsJson = fs.readFileSync('backups/chains.json', 'utf8');
        const chains = JSON.parse(chainsJson);
        await Chain.insertMany(chains);

        const eventtypesJson = fs.readFileSync('backups/eventtypes.json', 'utf8');
        const eventtypes = JSON.parse(eventtypesJson);
        await EventType.insertMany(eventtypes);

        const blocksJson = fs.readFileSync('backups/blocks.json', 'utf8');
        const blocks = JSON.parse(blocksJson);
        await ProcessedBlock.insertMany(blocks);

        const strategiesJson = fs.readFileSync('backups/strategies.json', 'utf8');
        const strategies = JSON.parse(strategiesJson);
        await Strategy.insertMany(strategies);

        const reportsJson = fs.readFileSync('backups/reports.json', 'utf8');
        const reports = JSON.parse(reportsJson);
        await StrategyReport.insertMany(reports);

        const tokensJson = fs.readFileSync('backups/tokens.json', 'utf8');
        const tokens = JSON.parse(tokensJson);
        await Token.insertMany(tokens);

        const usersJson = fs.readFileSync('backups/users.json', 'utf8');
        const users = JSON.parse(usersJson);
        await User.insertMany(users);

        const vaultsJson = fs.readFileSync('backups/vaults.json', 'utf8');
        const vaults = JSON.parse(vaultsJson);
        await Vault.insertMany(vaults);

        const snapshotsJson = fs.readFileSync('backups/snapshots.json', 'utf8');
        const snapshots = JSON.parse(snapshotsJson);
        await VaultSnapshot.insertMany(snapshots);

        const protocolsJson = fs.readFileSync('backups/protocols.json', 'utf8');
        const protocols = JSON.parse(protocolsJson);
        await Protocol.insertMany(protocols);


        res.json({ message: 'Data restored successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const processEvents = async () => {
    try {
        const newEvents: IBlockchainEvent[] = await BlockchainEvent.find({ processed: { $exists: false } })
            .sort({ blockTimestamp: 1, logIndex: 1 })
            .exec();

        console.log(`processing ${newEvents.length} new events...`,)

        for (let index = 0; index < newEvents.length; index++) {
            const event = newEvents[index];

            if (event) {
                await eventMain(event);
            }
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
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