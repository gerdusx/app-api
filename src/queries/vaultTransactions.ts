export const vaultTransactions = `
    query VaultTransactions {
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