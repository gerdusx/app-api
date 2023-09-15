const axios = require('axios');

// I'm assuming cache is a basic key-value store like "memory-cache". 
// If it's a different caching mechanism, adjustments might be needed.
const cache = require('memory-cache');

const graphqlEndpoint = 'https://data.staging.arkiver.net/gerdusx/reaperv2/graphql';

function createGraphQLCachingMiddleware(cacheKey: string, query: string) {
    return async (req:any, res:any, next:any) => {
        try {
            const dataCache = cache.get(cacheKey);

            // Check if data in cache is valid and not expired
            if (!dataCache || Date.now() > dataCache.expires) {
                // Fetch new data from the API
                const response = await axios.post(graphqlEndpoint, {
                    query: query
                });

                const expirationTimestamp = Date.now() + 30000; // Set to expire in 30 seconds

                cache.put(cacheKey, {
                    data: response.data.data,
                    expires: expirationTimestamp
                });

                res.locals.source = "api";
                res.locals.data = response.data.data;
            } else {
                // Use cached data
                res.locals.source = "cache";
                res.locals.data = dataCache.data;
            }
            
            next();
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch data from GraphQL server.' });
        }
    };
}

export default createGraphQLCachingMiddleware;
