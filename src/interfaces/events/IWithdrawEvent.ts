export interface IWithdrawEvent {
    sender: string;
    receiver: string;
    owner: string;
    assets: string;
    shares: string;
    blockTimestamp: number;
    chainId: number;
}