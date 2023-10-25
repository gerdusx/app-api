var cache = require('memory-cache');
import express, { Request, Response } from 'express';
import { IVaultDto } from '../interfaces/dto/IVaultDto';
import { updateApiCache } from './cacheHelper';
import { IChain } from '../models/Chain';
import { IToken } from '../models/Token';
import { ethers } from 'ethers';
import { ERC20 } from '../abi/contracts/ERC20';
import { getProviderByChain } from './getProviderByChain';
import Vault, { IVault } from '../models/Vault';
import { indexBlocks, indexEvents } from '../indexer';
import { VAULT_V2_ABI } from '../abi/vaultV2Abi';
import Strategy from '../models/Strategy';
import { REAPER_BASE_STRATEGY_V4 } from '../abi/ReaperBaseStrategyv4';
import { REAPER_STRATEGY_SONNE_V2 } from '../abi/ReaperStrategySonneV2';
import Protocol, { IProtocol } from '../models/Protocol';
import { processEvents } from '../utils';
import { ReaperStrategyGranarySupplyOnlyV2 } from '../abi/ReaperStrategyGranarySupplyOnlyV2';
import { ReaperStrategyStabilityPool } from '../abi/ReaperStrategyStabilityPool';

export const fetchVaults = async (req: Request, res: Response) => {
    try {
        let vaults = cache.get('vaults') as IVaultDto[];
        if (!vaults) {
            await updateApiCache();
            vaults = cache.get('vaults') as IVaultDto[];
        }

        res.json(vaults ?? []);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const createVault = async (req: Request, res: Response) => {
    try {
        console.log(req.body)

        // Destructure the address and chainId from the request body
        const { address, chainId } = req.body;

        const provider = getProviderByChain(chainId);
        const currentBlock = await provider?.getBlockNumber();
        let vault = await Vault.findOne({ address, chainId });

        if (!vault) {

            const newVault: IVault = {
                address,
                chainId,
                startingBlock: currentBlock ? currentBlock - 10 : 0,
                dataFetched: false
            }
            vault = await Vault.create(newVault);
            await indexEvents(chainId);
            await updateApiCache();
            return res.status(201).json(vault); // Return the created vault with a 201 status code
        }

        res.status(409).json({ message: 'Vault already exists' });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const updateStrategies = async (req: Request, res: Response) => {
    const strategies = await Strategy.find({chainId: 10});

    const abis = [
        REAPER_BASE_STRATEGY_V4,
        REAPER_STRATEGY_SONNE_V2,
        ReaperStrategyGranarySupplyOnlyV2,
        ReaperStrategyStabilityPool
    ]

    for (let index = 0; index < strategies.length; index++) {
        //for (let index = 0; index < 1; index++) {
        const strategy = strategies[index];
        const provider = getProviderByChain(strategy.chainId);

        let wantFound = false;

        for (let abiIndex = 0; abiIndex < abis.length; abiIndex++) {
            try {
                const contract = new ethers.Contract(strategy.address, abis[abiIndex], provider);
                const cWant: string = await contract.cWant();
                console.log(`cWant - ${strategy.address} - ${cWant}`);
                wantFound = true;

                await Strategy.updateOne({ _id: strategy._id }, { $set: { protocolAddress: cWant } });

                const cWantContract = new ethers.Contract(cWant, ERC20, provider);
                const [name, symbol, decimals] = await Promise.all([
                    cWantContract.name(),
                    cWantContract.symbol(),
                    cWantContract.decimals(),
                ])

                console.log("data: ", name, symbol, decimals)

                let protocol = await Protocol.findOne({ address: cWant });
                if (!protocol) {
                    const newProtocol = new Protocol({
                        address: cWant,
                        fork: "Compound",
                        chainId: strategy.chainId,
                        name,
                        symbol,
                        decimals: decimals.toString()
                    });

                    await newProtocol.save();
                } else {
                    // If the protocol exists, update its name, symbol, and decimals
                    protocol.name = name;
                    protocol.symbol = symbol;
                    protocol.decimals = decimals.toString();
                
                    await protocol.save();
                }

                break; // Break out of the inner loop once cWant is found
            } catch (error) {
                // If there's an error, it will continue to the next ABI
                //console.error(`Error with ABI index ${abiIndex}`);
            }

            if (!wantFound) {
                try {
                    const contract = new ethers.Contract(strategy.address, abis[abiIndex], provider);
                    const gWant: string = await contract.gWant();
                    console.log(`gWant - ${strategy.address} - ${gWant}`);
                    wantFound = true;

                    await Strategy.updateOne({ _id: strategy._id }, { $set: { protocolAddress: gWant } });

                    const gWantContract = new ethers.Contract(gWant, ERC20, provider);
                    const [name, symbol, decimals] = await Promise.all([
                        gWantContract.name(),
                        gWantContract.symbol(),
                        gWantContract.decimals(),
                    ])
    
                    console.log("data: ", name, symbol, decimals)
    
                    let protocol = await Protocol.findOne({ address: gWant });
                    if (!protocol) {
                        const newProtocol = new Protocol({
                            address: gWant,
                            fork: "Granary",
                            chainId: strategy.chainId,
                            name,
                            symbol,
                            decimals: decimals.toString()
                        });
    
                        await newProtocol.save();
                    } else {
                        protocol.name = name;
                        protocol.symbol = symbol;
                        protocol.decimals = decimals.toString();
                    
                        await protocol.save();
                    }

                    break;
                } catch (error) {
                    
                }
                
            }

            await delay(1000);
        }

        if (!wantFound) {
            console.log(`${strategy.address} - no want found for strategy ${index}`);
        }
    }

    res.json("done");
};

export const balances = async (req: Request, res: Response) => {
    try {
        const provider = getProviderByChain(10);

        const tokenAddr = "0x4200000000000000000000000000000000000042";
        const walletAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

        const contract = new ethers.Contract(tokenAddr, ERC20, provider);
        const balance = await contract.balanceOf(walletAddr);

        console.log("balance", ethers.formatUnits(balance, 18));

        res.json(req.body);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const readVault = async (req: Request, res: Response) => {
    try {
        const provider = getProviderByChain(10);

        const vaultAddr = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";
        const contract = new ethers.Contract(vaultAddr, VAULT_V2_ABI, provider);

        const [name, symbol, constructionTime, token, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            // contract.asset(),
            contract.constructionTime(),
            contract.token(),
            contract.decimals()
        ]);

        res.json({ name: name.toString(), symbol: symbol.toString(), constructionTime: constructionTime.toString(), token: token.toString(), decimals: decimals.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const fetchChains = async (req: Request, res: Response) => {
    try {
        let chains = cache.get('chains') as IChain[];
        if (!chains) {
            await updateApiCache();
            chains = cache.get('chains') as IChain[];
        }

        res.json(chains ?? []);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const fetchTokens = async (req: Request, res: Response) => {
    try {
        let tokens = cache.get('tokens') as IToken[];
        if (!tokens) {
            await updateApiCache();
            tokens = cache.get('tokens') as IToken[];
        }

        res.json(tokens ?? []);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

export const processEventsHandler = async (req: Request, res: Response) => {
    try {
        const chainId = 10; // or whichever chainId you want to index
        await indexEvents(chainId);
        const response = await processEvents();
        await updateApiCache();

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json(false);
    }
};