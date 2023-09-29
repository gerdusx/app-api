import express from 'express';
import cron from 'node-cron';
var cache = require('memory-cache');
const cors = require('cors');

import { connectToDb } from './db';
import { fetchVaultsWithCache, fetchTokensWithCache, fetchArkiverDataWithCache, backup, restoreBackup, processEvents } from './utils';
import { indexBlocks, indexEvents } from './indexer';
import { BlockchainEvent, IBlockchainEvent } from './models/BlockchainEvent';
import { eventMain } from './helpers/indexer/eventMain';
import { fetchChains, fetchVaults } from './helpers/routeHandlers';
import { updateApiCache } from './helpers/cacheHelper';

// Connect to the database
connectToDb();

const app = express();
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



// Indexing events every 10 seconds
cron.schedule('*/4 * * * *', async () => {
    try {
        const chainId = 10; // or whichever chainId you want to index
        await indexEvents(chainId);
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Schedule the task to run every 5 seconds
cron.schedule('*/10 * * * *', async () => {
    try {
        const chainId = 10; // or whichever chainId you want to index
        await indexBlocks(chainId);
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
                    await updateApiCache();
                }
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});