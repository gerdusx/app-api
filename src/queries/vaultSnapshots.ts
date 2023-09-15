export const vaultSnapshots = `
query VaultSnapshots {
    VaultSnapshots(sort: TIMESTAMP_DESC, limit: 0) {
      _id
      depositCount
      deposits
      lockedProfit
      pricePerFullShare
      timestamp
      totalAllocated
      totalAssets
      totalIdle
      totalSupply
      vault {
        _id
        chainId
      }
      vaultAddress
      withdrawCount
      withdrawals
      lastBlockTimestamp
      totalAllocBPS
      tvlCap
    }
  }
`;