export const vaultList = `
query VaultList {
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
  }
`;