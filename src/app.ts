import express from 'express';
import cron from 'node-cron';
var cache = require('memory-cache');
const cors = require('cors');

import { connectToDb } from './db';
import { fetchVaultsWithCache, fetchTokensWithCache, fetchArkiverDataWithCache, backup, restoreBackup, processEvents } from './utils';
import { indexBlocks, indexEvents, indexStrategies } from './indexer';
import { BlockchainEvent, IBlockchainEvent } from './models/BlockchainEvent';
import { eventMain } from './helpers/indexer/eventMain';
import { balances, createVault, fetchChains, fetchVaults, processEventsHandler, readVault, updateStrategies } from './helpers/routeHandlers';
import { updateApiCache, updateTokensCache } from './helpers/cacheHelper';
import Chain from './models/Chain';

// Connect to the database
connectToDb();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3010;

app.get('/', (req, res) => {
    res.json("home");
});

app.get('/api/vaults', fetchVaultsWithCache);
app.get('/api/tokens', fetchTokensWithCache);
app.get('/api/arkiver/data', fetchArkiverDataWithCache);
app.get('/api/backup', backup);
app.get('/api/restorebackup', restoreBackup);
app.get('/api/processevents', processEvents);

app.get('/api/dto/vaults', fetchVaults);
app.get('/api/dto/chains', fetchChains);
app.get('/api/dto/tokens', fetchTokensWithCache);

app.post('/api/vaults', createVault);
app.post('/api/balances', balances);


app.post('/api/readvault', readVault);
app.get('/api/strategies/update', updateStrategies);
app.get('/api/events/process', processEventsHandler);


const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Indexing events every 10 seconds
cron.schedule('*/6 * * * *', async () => {
    try {
        const chains = await Chain.find({chainId: 10});

        for (const chain of chains) {
            await indexEvents(chain.chainId);
            await sleep(3000);
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Schedule the task to run every 5 seconds
cron.schedule('*/8 * * * *', async () => {
    try {
        const chains = await Chain.find({chainId: 10});

        for (const chain of chains) {
            await indexBlocks(chain.chainId);
            await sleep(3000);
        }
        
        await updateApiCache();
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});


//Processing saved events every 5mins
cron.schedule('*/5 * * * *', async () => {
    try {
        const reset = false;
        if (reset) {
            console.log("resetting...");
            const result = await BlockchainEvent.updateMany({}, { $unset: { processed: 1 } });
            console.log("resetting done");
        } else {

            const newEvents: IBlockchainEvent[] = await BlockchainEvent.find({processed: { $exists: false }})
            .sort({ blockTimestamp: 1, logIndex: 1 })
            .limit(300)
            .exec();

            console.log(`processing ${newEvents.length} new events...`, )

            for (let index = 0; index < newEvents.length; index++) {
                const event = newEvents[index];

                if (event) {
                    await eventMain(event);
                }
            }

            if (newEvents?.length > 0) {
                await updateApiCache();
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Schedule the task to run every 5 seconds - update tokens
cron.schedule('*/20 * * * *', async () => {
    try {
        updateTokensCache();
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});