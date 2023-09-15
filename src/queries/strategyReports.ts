export const strategyReports = `
query StrategyReports {
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
    }
  }
`;