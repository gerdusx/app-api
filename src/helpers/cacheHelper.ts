var cache = require('memory-cache');
import axios from "axios";
import { IStrategyDto } from "../interfaces/dto/IStrategyDto";
import { IVaultDto } from "../interfaces/dto/IVaultDto";
import Strategy, { IStrategy } from "../models/Strategy";
import StrategyReport, { IStrategyReport } from "../models/StrategyReport";
import Token, { IToken } from "../models/Token";
import Vault, { IVault } from "../models/Vault"
import { IVaultSnapshot, VaultSnapshot } from "../models/VaultSnapshot";
import { filterLastXDays } from "./data/filterLastXDays";
import { ethers, formatUnits, parseUnits } from "ethers";
import { IVaultSnapshotDto, ISnapshot_Delta } from "../interfaces/dto/IVaultSnapshotDto";
import Chain, { IChain } from "../models/Chain";
import { sortTimestampByProp } from "./data/sortTimestampByProp";
import { IUser, User } from "../models/User";

export const updateApiCache = async () => {
    console.log("updating api cache")
    const [vaults, strategies, strategyReports, vaultSnapshots, tokens, chains] = await Promise.all([
        Vault.find(),
        Strategy.find(),
        StrategyReport.find().sort({ reportDate: 1 }),
        VaultSnapshot.find().sort({ timestamp: 1 }),
        getTokensWithUsdValues(),
        Chain.find()
    ]);

    const updatedSnapshots = await updateVaultsnapshotCache(vaultSnapshots, tokens, vaults);
    updateStrategyCache(strategies, strategyReports);
    updateVaultCache(vaults, tokens, updatedSnapshots);
    updateVaultLastsnapshotDeltas();
    const updatedChains = await updateChainCache(chains);
    updateChainLastsnapshotDeltas(updatedChains || []);

    console.log("updating done")
}

const updateVaultCache = (vaults: IVault[], tokens: IToken[], vaultSnapshotsCache: IVaultSnapshotDto[]): IVaultDto[] => {
    const strategiesCache = cache.get('strategies') as IStrategyDto[];
    // const vaultSnapshotsCache = cache.get('vaultSnapshots') as IVaultSnapshot[];

    const plainVaults = vaults.map((v: any) => v.toObject());
    const vaultsDto = plainVaults.map(vault => {
        const currentVaultSnapshots = vaultSnapshotsCache.filter(x => x.vaultAddress?.toLowerCase() === vault.address?.toLowerCase()).map(snapshot => {
            // const totalAssets = (Number(formatUnits(snapshot.totalAllocated, vault.decimals)) + Number(formatUnits(snapshot.totalIdle, vault.decimals)));
            const totalAssets = BigInt(snapshot.totalAllocated) + BigInt(snapshot.totalIdle);

            return {
                ...snapshot,
                totalAssets: totalAssets.toString()
            }
        });
        const currentVaultStrategies = strategiesCache.filter(x => x.vaultAddress?.toLowerCase() === vault.address.toLowerCase() && x.isActive);
        const currentVaultToken = vault.token ? tokens.find(x => x.address?.toLowerCase() === vault.token?.toLowerCase()) : undefined;

        const lastSnapShot = currentVaultSnapshots[currentVaultSnapshots.length - 1];

        const dto: IVaultDto = {
            ...vault,
            tokenDto: currentVaultToken,
            strategies: currentVaultStrategies,
            last30SnapShots: currentVaultSnapshots.slice(-30),
            lastSnapShot
        }

        return dto;
    })

    cache.put('vaults', vaultsDto);
    return vaultsDto
}

const updateVaultsnapshotCache = async (vaultSnapshots: IVaultSnapshot[], tokens: IToken[], vaults: IVault[]): Promise<IVaultSnapshot[]> => {
    const users = await User.find()
    const snapshots = vaultSnapshots.map((snapshot: any) => {
        const vault = vaults.find((x: any) => x.address.toLowerCase() === snapshot.vaultAddress.toLowerCase());

        if (vault) {
            const reaperToken = tokens.find((x: any) => x.address.toLowerCase() === vault?.token?.toLowerCase()) as IToken;

            let usdValues = {
                usd: {
                    tvl: 0,
                    totalAllocated: 0,
                    totalIdle: 0
                }
            };

            if (reaperToken) {
                const totalAllocatedUnits = ethers.formatUnits(snapshot.totalAllocated, vault.decimals);
                const totalIdleUnits = ethers.formatUnits(snapshot.totalIdle, vault.decimals);

                const balance = Number(totalAllocatedUnits) + Number(totalIdleUnits);
                usdValues.usd.tvl = balance * reaperToken.usd;
                usdValues.usd.totalAllocated = Number(totalAllocatedUnits) * reaperToken.usd;
                usdValues.usd.totalIdle = Number(totalIdleUnits) * reaperToken.usd;
            }

            return {
                ...snapshot.toObject(),
                usd: usdValues.usd,
                users: {
                    totalUsers: users.filter(x => x.vaultAddress.toLowerCase() === vault.address.toLowerCase() && x.created <= snapshot.timestamp)?.length || 0
                }
            }
        }

        return {
            ...snapshot.toObject()
        }

    });

    cache.put('vaultSnapshots', snapshots);
    return snapshots;
}

const updateStrategyCache = (strategies: IStrategy[], strategyReports: IStrategyReport[]): IStrategyDto[] => {
    const plainStrategies = strategies.map((v: any) => v.toObject()) as IStrategy[];
    const strategiesDto = plainStrategies.map(strategy => {

        const currentStrategyReports = strategyReports.filter(x => x.strategyAddress.toLowerCase() === strategy.address.toLowerCase());

        const inDateRangeReports = filterLastXDays(currentStrategyReports, "reportDate", new Date().getTime(), 30) as IStrategyReport[];

        const dto: IStrategyDto = {
            ...strategy,
            lastReport: currentStrategyReports[currentStrategyReports.length - 1],
            aprReports: inDateRangeReports,
            isActive: strategy.allocBPS !== "0"
        }

        return dto;
    })

    cache.put('strategies', strategiesDto);
    return strategiesDto
}

const updateChainCache = async (chains: IChain[]) => {
    try {
        const users = await User.find();
        const vaults = cache.get('vaults') as IVaultDto[];
        const plainChains = chains.map((v: any) => v.toObject()) as IChain[];
        const plainUsers = users.map((v: any) => v.toObject()) as IUser[];

        for (const chain of plainChains) {
            const chainVaults = vaults.filter(x => x.chainId === chain.chainId);
            const chainUsers = plainUsers.filter(x => x.chainId === chain.chainId);

            chain.last30SnapShots = aggregateChainSnapshots(chainVaults, chainUsers);
        }

        return plainChains;
    } catch (error) {
        console.log(error)
    }

}

export const updateTokensCache = async () => {
    const tokens = await Token.find();
    const coinIds = tokens.map(token => token.coinId).join(",");
    let coinGeckoQuery = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`;
    const coinsResponse = await axios.get(coinGeckoQuery);
    const updatedTokens: IToken[] = tokens.map(token => {
        const usdValue = token.coinId ? coinsResponse.data[token.coinId]?.usd : 0;
        return {
            ...token.toObject(),
            usd: usdValue
        }
    });

    cache.put('tokens', updatedTokens);
};

export const getTokensWithUsdValues = async (): Promise<IToken[]> => {
    let tokens = cache.get('tokens') as IToken[];
    if (!tokens) {
        updateTokensCache();
        tokens = cache.get('tokens') as IToken[];
    }
    return tokens;
};

export const updateVaultLastsnapshotDeltas = (): IVaultDto[] => {
    const vaults = cache.get('vaults') as IVaultDto[];

    const updatedVaults = vaults.map(vault => {

        const latestTvl = getTvlFromSnapshot(vault, 0);
        const { diff: diff1, perc: perc1 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromSnapshot(vault, 1));
        const { diff: diff7, perc: perc7 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromSnapshot(vault, 6));
        const { diff: diff30, perc: perc30 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromSnapshot(vault, 29));

        const latestTotalUsers = getTotalUsersFromSnapshot(vault, 0);
        const { diff: diff1_users, perc: perc1_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromSnapshot(vault, 1));
        const { diff: diff7_users, perc: perc7_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromSnapshot(vault, 6));
        const { diff: diff30_users, perc: perc30_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromSnapshot(vault, 29));

        const tvlDeltas: ISnapshot_Delta = {
            diff: {
                days1: diff1,
                days7: diff7,
                days30: diff30,
            },
            perc: {
                days1: perc1,
                days7: perc7,
                days30: perc30,
            }
        }

        const totalUsersDeltas: ISnapshot_Delta = {
            diff: {
                days1: diff1_users,
                days7: diff7_users,
                days30: diff30_users,
            },
            perc: {
                days1: perc1_users,
                days7: perc7_users,
                days30: perc30_users,
            }
        }

        const updatedVault: IVaultDto = {
            ...vault,
            lastSnapShot: {
                ...vault.lastSnapShot,
                deltas: {
                    tvl: tvlDeltas,
                    totalUsers: totalUsersDeltas
                }
            }
        }

        return updatedVault
    })


    cache.put('vaults', updatedVaults);
    return updatedVaults;
}

const updateChainLastsnapshotDeltas = (chains: IChain[]): IChain[] => {

    const updatedChains = chains.map(chain => {
        const latestTvl = getTvlFromChainSnapshot(chain, 0);
        const { diff: diff1, perc: perc1 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromChainSnapshot(chain, 1));
        const { diff: diff7, perc: perc7 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromChainSnapshot(chain, 6));
        const { diff: diff30, perc: perc30 } = calculateTvlDiffAndPerc(latestTvl, getTvlFromChainSnapshot(chain, 29));

        const latestTotalUsers = getTotalUsersFromChainSnapshot(chain, 0);
        const { diff: diff1_users, perc: perc1_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromChainSnapshot(chain, 1));
        const { diff: diff7_users, perc: perc7_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromChainSnapshot(chain, 6));
        const { diff: diff30_users, perc: perc30_users } = calculateTvlDiffAndPerc(latestTotalUsers, getTotalUsersFromChainSnapshot(chain, 29));

        const tvlDeltas: ISnapshot_Delta = {
            diff: {
                days1: diff1,
                days7: diff7,
                days30: diff30,
            },
            perc: {
                days1: perc1,
                days7: perc7,
                days30: perc30,
            }
        };

        const totalUsersDeltas: ISnapshot_Delta = {
            diff: {
                days1: diff1_users,
                days7: diff7_users,
                days30: diff30_users,
            },
            perc: {
                days1: perc1_users,
                days7: perc7_users,
                days30: perc30_users,
            }
        };

        const updatedChain: IChain = {
            ...chain,
            lastSnapShotDelta: {
                tvl: tvlDeltas,
                totalUsers: totalUsersDeltas
            }
        };

        return updatedChain;
    });

    cache.put('chains', updatedChains);
    return updatedChains;
};

const getTvlFromChainSnapshot = (chain: IChain, daysAgo: number): number => {
    if (!chain.last30SnapShots || chain.last30SnapShots.length <= daysAgo) return 0;
    return chain.last30SnapShots[chain.last30SnapShots.length - 1 - daysAgo].tvl;
};

const getTotalUsersFromChainSnapshot = (chain: IChain, daysAgo: number): number => {
    if (!chain.last30SnapShots || chain.last30SnapShots.length <= daysAgo) return 0;
    return chain.last30SnapShots[chain.last30SnapShots.length - 1 - daysAgo].totalUsers;
};

const getTvlFromSnapshot = (vault: IVaultDto, index: number) => {
    const lastIndex = vault.last30SnapShots.length - 1;
    const validIndex = (lastIndex - index) >= 0 ? (lastIndex - index) : lastIndex;
    return vault.last30SnapShots[validIndex]?.usd?.tvl || 0;
};

const getTotalUsersFromSnapshot = (vault: IVaultDto, index: number) => {
    const lastIndex = vault.last30SnapShots.length - 1;
    const validIndex = (lastIndex - index) >= 0 ? (lastIndex - index) : lastIndex;
    return vault.last30SnapShots[validIndex]?.users?.totalUsers || 0;
};

const calculateTvlDiffAndPerc = (latestTvl: number, previousTvl: number) => {
    const diff = latestTvl - previousTvl;
    const perc = (previousTvl !== 0) ? (diff / previousTvl) * 100 : 0;
    return { diff, perc };
};

export const aggregateChainSnapshots = (vaults: IVaultDto[], users: IUser[]): { timestamp: number; tvl: number; totalUsers: number }[] => {
    try {
        // First, flatten all the snapshots from all vaults into one array
        const allSnapshots: IVaultSnapshotDto[] = vaults.flatMap(vault => vault.last30SnapShots);

        // Now, use the same aggregation logic but for the flattened array
        const aggregatedDataMap: Record<number, { timestamp: number; tvl: number; totalUsers: number }> = allSnapshots.reduce((acc: Record<number, { timestamp: number; tvl: number; totalUsers: number }>, snapshot) => {

            if (!acc[snapshot.timestamp]) {
                const numberOfUsers = users.filter(x => x.created <= snapshot.timestamp)?.length || 0;
                acc[snapshot.timestamp] = {
                    timestamp: snapshot.timestamp,
                    tvl: 0,
                    totalUsers: numberOfUsers
                };
            }

            acc[snapshot.timestamp].tvl += snapshot.usd?.tvl || 0;
            acc[snapshot.timestamp].totalUsers += snapshot.users?.totalUsers || 0;
            return acc;
        }, {});

        let aggregatedData = Object.values(aggregatedDataMap);

        return sortTimestampByProp(aggregatedData, "timestamp", "asc").slice(-30);
    } catch (error) {
        console.log(error)
    }

    return [];
};