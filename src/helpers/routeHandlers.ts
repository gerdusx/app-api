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
        // const walletAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

        // const contract = new ethers.Contract(tokenAddr, ERC20, provider);
        // const balance = await contract.balanceOf(walletAddr);

        // console.log("balance", ethers.formatUnits(balance, 18));

        //const provider = getProviderByChain(event.chainId);
    
        const contract = new ethers.Contract(vaultAddr, VAULT_V2_ABI, provider);

        const [name, symbol, constructionTime, token, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            // contract.asset(),
            contract.constructionTime(),
            contract.token(),
            contract.decimals()
        ]);

        res.json({name: name.toString(), symbol: symbol.toString(), constructionTime: constructionTime.toString(), token: token.toString(), decimals: decimals.toString()});
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