import { IVaultSnapshotDto } from "../../interfaces/dto/IVaultSnapshotDto";
import { fetchVaultsFromCacheOrDb } from "../../utils";
import { sortTimestampByProp } from "../data/sortTimestampByProp";
import { getDeposits } from "./events/deposit";

export const updateVaultsnapshots = async (snapshots: any[]) => {
    let updatedSnapshots = await updateVaultSnapshotsTotalUsers(snapshots);
    //updatedSnapshots = await updateLastVaultSnapshotsDeltas(updatedSnapshots);

    return updatedSnapshots;
}

export const updateVaultSnapshotsTotalUsers = async (snapshots: any[]) => {

    //Getting all the deposits
    const deposits = await getDeposits();

 
    const updatedSnapshots = snapshots.map((snapshot, index) => {

        //filter by vault and timestamp
        const snapshotDeposits = deposits.filter(x => x.blockTimestamp <= snapshot.timestamp && x.vaultAddress.toLowerCase() === snapshot.vaultAddress.toLowerCase());
        
        const uniqueUsers = new Set(snapshotDeposits.map(deposit => deposit.owner));
        
        return {
            ...snapshot,
            users: {
                totalUsers: uniqueUsers.size
            }
        }
    })

    return updatedSnapshots;
}

export const updateLastVaultSnapshotsDeltas = async (snapshots: IVaultSnapshotDto[]): Promise<IVaultSnapshotDto[]> => {
    const vaults = await fetchVaultsFromCacheOrDb();
    
    const updatedSnapshots: IVaultSnapshotDto[] = [...snapshots]; // start with all original snapshots

    for (const vault of vaults) {
        const vaultSnapshots = sortTimestampByProp(snapshots.filter(x => x.vaultAddress.toLowerCase() === vault.address.toLowerCase()), "timestamp", "asc") as IVaultSnapshotDto[];

        if (vaultSnapshots.length > 0) {
            const lastSnapshot = vaultSnapshots[0];

            const { diff: diff1, perc: perc1 } = calculateTvlDiffAndPerc(vaultSnapshots[0].usd?.tvl || 0, vaultSnapshots.length > 1 ? vaultSnapshots[1].usd?.tvl || 0 : vaultSnapshots[0].usd?.tvl || 0);
            const { diff: diff7, perc: perc7 } = calculateTvlDiffAndPerc(vaultSnapshots[0].usd?.tvl || 0, vaultSnapshots.length > 7 ? vaultSnapshots[6].usd?.tvl || 0 : vaultSnapshots[0].usd?.tvl || 0);
            const { diff: diff30, perc: perc30 } = calculateTvlDiffAndPerc(vaultSnapshots[0].usd?.tvl || 0, vaultSnapshots.length > 30 ? vaultSnapshots[29].usd?.tvl || 0 : vaultSnapshots[0].usd?.tvl || 0);
        
            const tvlDiff = {
                days1: diff1,
                days7: diff7,
                days30: diff30,
            };
        
            const tvlPerc = {
                days1: perc1,
                days7: perc7,
                days30: perc30,
            };

            if (lastSnapshot.vaultAddress === "0x1bad45e92dce078cf68c2141cd34f54a02c92806") {
                console.log("vaultSnapshots[0].tvl", vaultSnapshots[0].usd?.tvl || 0)
                console.log("lastSnapshot", lastSnapshot)
                console.log("tvlDiff", tvlDiff)
                console.log("tvlPerc", tvlPerc)
            }

            // Update the snapshot with deltas
            const indexToUpdate = updatedSnapshots.findIndex(snap => snap.vaultAddress.toLowerCase() === vault.address.toLowerCase() && snap.timestamp === lastSnapshot.timestamp);
            if (indexToUpdate !== -1) {
                updatedSnapshots[indexToUpdate].deltas = {
                    tvl: {
                        diff: tvlDiff,
                        perc: tvlPerc
                    }
                };
            }

            
        }
    }

    return updatedSnapshots;
};

const calculateTvlDiffAndPerc = (latestTvl: number, previousTvl: number) => {
    const diff = latestTvl - previousTvl;
    const perc = (previousTvl !== 0) ? (diff / previousTvl) * 100 : 0;
    return { diff, perc };
};