export const strategies = `
query Strategys {
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
  }
`;