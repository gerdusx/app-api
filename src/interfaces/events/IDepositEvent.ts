export interface IDepositEvent {
    sender: string;
    owner: string;
    assets: string;
    shares: string;
    blockTimestamp: number;
    chainId: number;
    vaultAddress: string;
}