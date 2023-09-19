export const gqlquery = `
    query ChainList {
        Chains {
            _id
            chainId
            name
        }
        Strategys {
            _id
            address
            allocBPS
            block
            chainId
            dateAdded
            dateRevoked
            feeBPS
            hash
            isActive
            vaultAddress
            lastReport {
              _id
              block
              hash
              reportDate
              strategyAddress
              vaultAddress
              gain
              loss
              debtPaid
              gains
              losses
              allocated
              allocationAdded
              allocBPS
              duration
            }
        }
        StrategyReports(sort: BLOCK_DESC, limit: 0) {
            _id
            allocBPS
            allocated
            allocationAdded
            block
            debtPaid
            duration
            gain
            gains
            hash
            loss
            losses
            reportDate
            strategyAddress
            vaultAddress
            chainId
          }
        Users {
            _id
            address
            dateAdded
        }  
        Vaults {
            _id
            address
            asset
            token
            decimals
            chain {
              _id
              chainId
              name
            }
            constructionTime
            name
            symbol
          }
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
          VaultTransactions(sort: BLOCK_DESC, limit: 0) {
            _id
            assets
            block
            chainId
            dateExecuted
            hash
            owner
            receiver
            sender
            shares
            transactionType
            vaultAddress
            user {
                _id
                dateAdded
                address
            }
            }
    }
`;