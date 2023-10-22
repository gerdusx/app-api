import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { VAULT_V2_ABI } from './abi/vaultV2Abi';
var cache = require('memory-cache');
import { BlockchainEvent } from './models/BlockchainEvent';
import { addBlockChainEventsToCache, fetchBlockChainEventsWithCache, fetchVaultsFromCacheOrDb, getLatestProcessedBlock, updateLatestProcessedBlock } from './utils';
import Vault, { IVault } from './models/Vault';
import { getProviderByChain } from './helpers/getProviderByChain';
import { VaultSnapshot } from './models/VaultSnapshot';

dotenv.config();

const contractInterface = new ethers.Interface(VAULT_V2_ABI);

export const indexEvents = async (chainId: number) => {

    try {
        const provider = getProviderByChain(chainId);

        if (provider) {
            const vaults = await Vault.find() as IVault[];
            const vaultAddresses = vaults.filter(x => x.chainId === chainId).map(vault => vault.address.toLowerCase());

            //let nextBlock = cache.get(`eventHandler:${chainId}`);
            const processedBlock = await getLatestProcessedBlock(chainId, "event");

            const currentBlock = await provider.getBlockNumber();

            const startBlock = processedBlock.latestBlock;
            let endBlock = startBlock + processedBlock.blocksToFetch - 1;

            if (endBlock > currentBlock) {
                endBlock = currentBlock
            }

            const eventsToSave: any[] = [];
            await Promise.all(vaultAddresses.map(async vaultAddress => {

                const rawLogs = await provider.getLogs({
                    address: vaultAddress,
                    fromBlock: startBlock,
                    toBlock: endBlock
                });

                for (let logIndex = 0; logIndex < rawLogs.length; logIndex++) {

                    const log: any = rawLogs[logIndex];
                    let parsedLog = contractInterface.parseLog(log);
                    const blockTimestamp = (await provider.getBlock(log.blockNumber))?.timestamp;
                    if (parsedLog) {
                        eventsToSave.push({
                            blockNumber: log.blockNumber,
                            transactionHash: log.transactionHash,
                            blockTimestamp: blockTimestamp,
                            logIndex,
                            chainId,
                            contractAddress: log.address,
                            eventName: parsedLog.name,
                            eventSignature: parsedLog.signature,
                            eventParameters: parsedLog.args,
                            eventParametersString: parsedLog.args.map(x => x.toString()).join(",")
                        });
                    }
                }
            }));

            // // Filter out events that are already in the database
            const cachedEvents = await fetchBlockChainEventsWithCache();
            const uniqueEventsToSave = eventsToSave.filter(event => !cachedEvents.some(
                cachedEvent => cachedEvent.chainId === chainId &&
                    cachedEvent.transactionHash === event.transactionHash &&
                    cachedEvent.eventName === event.eventName &&
                    cachedEvent.eventParametersString === event.eventParametersString
            ));

            // // Save unique events in bulk
            if (uniqueEventsToSave.length > 0) {
                await BlockchainEvent.insertMany(uniqueEventsToSave);
                addBlockChainEventsToCache(uniqueEventsToSave);
            }

            await updateLatestProcessedBlock(chainId, endBlock, "event");

            console.log(`chain: ${chainId} - ${startBlock} to ${endBlock} - new events: ${eventsToSave.length}, unique events: ${uniqueEventsToSave.length} - cached events: ${cachedEvents.length} (#blocks: ${endBlock - startBlock})`)
        } else {
            console.log("No provider found")
        }
    } catch (error) {
        console.log(error)
    }
};

const DAY = 60 * 60 * 24;
const nearestDay = (now: number) => {
    return Math.floor(now / DAY) * DAY;
};

export const indexBlocks = async (chainId: number) => {
    try {
        const provider = getProviderByChain(chainId);

        if (provider) {
            const vaults = (await fetchVaultsFromCacheOrDb()).filter(x => x.chainId === chainId);
            const vaultAddresses = vaults.filter(x => x.chainId === chainId).map(vault => vault.address.toLowerCase());
            const processedBlock = await getLatestProcessedBlock(chainId, "block");

            const startBlock = processedBlock.latestBlock;

            const currentBlock = await provider.getBlockNumber();
            const blocksToCurrentBlock = currentBlock - startBlock;

            const blocksToFetch = blocksToCurrentBlock < processedBlock.blocksToFetch ? blocksToCurrentBlock : processedBlock.blocksToFetch;

            // const endBlock = blocksToCurrentBlock < nextBlock.blocksToFetch ? startBlock + blocksToCurrentBlock : startBlock + nextBlock.blocksToFetch

            const blocksToIndex = getBlocksToFetch(startBlock, blocksToFetch, processedBlock.blockInterval, currentBlock);

            // console.log("blocksToIndex", blocksToIndex)

            if (blocksToIndex?.length > 0) {
                await Promise.all(vaultAddresses.map(async vaultAddress => {
                    for (const blockNumber of blocksToIndex) {

                        const block = await provider.getBlock(blockNumber);

                        const now = Number(block?.timestamp);
                        const nowDay = nearestDay(Number(now));

                        const contract = new ethers.Contract(vaultAddress, VAULT_V2_ABI, provider);

                        const [totalIdle, totalAllocated, getPricePerFullShare, totalSupply, totalAllocBPS, tvlCap] = await Promise.all([
                            contract.totalIdle({blockTag: blockNumber}),
                            contract.totalAllocated({blockTag: blockNumber}),
                            contract.getPricePerFullShare({blockTag: blockNumber}),
                            contract.totalSupply({blockTag: blockNumber}),
                            contract.totalAllocBPS({blockTag: blockNumber}),
                            contract.tvlCap({blockTag: blockNumber}),
                        ])

                        const currentSnapshot = await VaultSnapshot.findOne({
                            timestamp: nowDay,
                            vaultAddress: vaultAddress.toLowerCase(),
                            chainId
                        });

                        if (!currentSnapshot) {
                            // Create a new snapshot
                            const newSnapshot = new VaultSnapshot({
                                timestamp: nowDay,
                                lastBlockTimestamp: now,
                                vaultAddress: vaultAddress.toLowerCase(),
                                totalIdle: totalIdle.toString(),
                                totalAllocated: totalAllocated.toString(),
                                chainId: chainId,
                                pricePerFullShare: getPricePerFullShare.toString(),
                                totalSupply: totalSupply.toString(),
                                totalAllocBPS: totalAllocBPS.toString(),
                                tvlCap: tvlCap.toString(),
                            });

                            await newSnapshot.save();
                        } else {
                            // Update existing snapshot
                            currentSnapshot.lastBlockTimestamp = now;
                            currentSnapshot.totalIdle = totalIdle.toString();
                            currentSnapshot.totalAllocated = totalAllocated.toString();
                            currentSnapshot.pricePerFullShare = getPricePerFullShare.toString();
                            currentSnapshot.totalSupply = totalSupply.toString();
                            currentSnapshot.totalAllocBPS = totalAllocBPS.toString();
                            currentSnapshot.tvlCap = tvlCap.toString();

                            await currentSnapshot.save();
                        }
                    }
                }));

                console.log(`chain ${chainId} - Blocks indexed: ${blocksToIndex[0]} to ${blocksToIndex[blocksToIndex.length - 1]} - blocks indexed - ${blocksToIndex}`);

                await updateLatestProcessedBlock(chainId, blocksToIndex[blocksToIndex.length - 1], "block");

            } else {
                console.log(`chain ${chainId} - No blocks to index - current block - ${currentBlock} - next block - ${processedBlock.latestBlock + processedBlock.blocksToFetch}`)
            }



        }
    } catch (error: any) {
        if (error.error?.code === 429) {
            console.log(`Blocks indexed: cpu capacity exceeded`);
        } else {
            console.log(error.info.error)
            console.log(error.info.payload.params)
        }

    }
}

const getBlocksToFetch = (startBlock: number, blocksToFetch: number, interval: number, currentBlocknumber: number) => {
    const blockNumbers = [];

    // Calculate how many blocks we should fetch based on the interval
    const blocksCount = Math.floor(blocksToFetch / interval);

    for (let i = 0; i < blocksCount; i++) {
        startBlock += interval;
        if (startBlock < currentBlocknumber) {
            blockNumbers.push(startBlock);
        }
    }

    return blockNumbers;
}