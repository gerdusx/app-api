import cron from 'node-cron';
import { updateCacheData } from './utils';

cron.schedule('*/5 * * * *', async () => {
    try {
        await updateCacheData();
        console.log('Data refreshed from GraphQL server.');
    } catch (error) {
        console.error('Failed to fetch data from GraphQL server.', error);
    }
});