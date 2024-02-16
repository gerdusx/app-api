import express, { Request, Response } from 'express';
import Vault from "../../models/Vault";
import Token from '../../models/Token';

export const fetchGrafanaVaults = async (req: Request, res: Response) => {
    try {
        const vaults = await Vault.find();
        res.json(vaults);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

export const fetchGrafanaTokens = async (req: Request, res: Response) => {
    try {
        const tokens = await Token.find();
        res.json(tokens);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};