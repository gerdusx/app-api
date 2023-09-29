var cache = require('memory-cache');
import express, { Request, Response } from 'express';
import { IVaultDto } from '../interfaces/dto/IVaultDto';
import { updateApiCache } from './cacheHelper';
import { IChain } from '../models/Chain';
import { IToken } from '../models/Token';

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