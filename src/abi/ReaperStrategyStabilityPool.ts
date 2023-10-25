export const ReaperStrategyStabilityPool = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "exchangeType",
                "type": "uint256"
            }
        ],
        "name": "InvalidExchangeType",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "exchangeEnum",
                "type": "uint256"
            }
        ],
        "name": "InvalidUsdcToErnExchange",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "twapEnum",
                "type": "uint256"
            }
        ],
        "name": "InvalidUsdcToErnTWAP",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "previousAdmin",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "AdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "beacon",
                "type": "address"
            }
        ],
        "name": "BeaconUpgraded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "version",
                "type": "uint8"
            }
        ],
        "name": "Initialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "previousAdminRole",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "newAdminRole",
                "type": "bytes32"
            }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "implementation",
                "type": "address"
            }
        ],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "ADMIN",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "CARDINALITY_PER_MINUTE",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ETHOS_DECIMALS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "FUTURE_NEXT_PROPOSAL_TIME",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "GUARDIAN",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "KEEPER",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PERCENT_DIVISOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "STRATEGIST",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "UPGRADE_TIMELOCK",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "balanceOfPool",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_ernCollateralValue",
                "type": "uint256"
            }
        ],
        "name": "balanceOfPoolCommon",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "balanceOfPoolUsingPriceFeed",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "balanceOfWant",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "clearUpgradeCooldown",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "compoundingFeeMarginBPS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentUsdcErnTWAP",
        "outputs": [
            {
                "internalType": "enum ReaperStrategyStabilityPool.TWAP",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyExit",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ernMinAmountOutBPS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "exchangeSettings",
        "outputs": [
            {
                "internalType": "address",
                "name": "veloRouter",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "balVault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "uniV3Router",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "uniV2Router",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getERNValueOfCollateralGain",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ernValueOfCollateral",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_usdValueOfCollateralGain",
                "type": "uint256"
            }
        ],
        "name": "getERNValueOfCollateralGainCommon",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ernValueOfCollateral",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getERNValueOfCollateralGainUsingPriceFeed",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ernValueOfCollateral",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint128",
                "name": "_baseAmount",
                "type": "uint128"
            },
            {
                "internalType": "uint32",
                "name": "_period",
                "type": "uint32"
            }
        ],
        "name": "getErnAmountForUsdcUniV3",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ernAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleAdmin",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getRoleMember",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleMemberCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUSDValueOfCollateralGain",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "usdValueOfCollateralGain",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUSDValueOfCollateralGainUsingPriceFeed",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "usdValueOfCollateralGain",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "harvest",
        "outputs": [
            {
                "internalType": "int256",
                "name": "roi",
                "type": "int256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "hasRole",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_vault",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_swapper",
                "type": "address"
            },
            {
                "internalType": "address[]",
                "name": "_strategists",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "_multisigRoles",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "_keepers",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "_priceFeed",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_uniV3TWAP",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "veloRouter",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "balVault",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "uniV3Router",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "uniV2Router",
                        "type": "address"
                    }
                ],
                "internalType": "struct ReaperStrategyStabilityPool.ExchangeSettings",
                "name": "_exchangeSettings",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "stabilityPool",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "veloUsdcErnPool",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "uniV3UsdcErnPool",
                        "type": "address"
                    }
                ],
                "internalType": "struct ReaperStrategyStabilityPool.Pools",
                "name": "_pools",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "want",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "usdc",
                        "type": "address"
                    }
                ],
                "internalType": "struct ReaperStrategyStabilityPool.Tokens",
                "name": "_tokens",
                "type": "tuple"
            },
            {
                "internalType": "enum ReaperStrategyStabilityPool.TWAP",
                "name": "_currentUsdcErnTWAP",
                "type": "uint8"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "initiateUpgradeCooldown",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastHarvestTimestamp",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceFeed",
        "outputs": [
            {
                "internalType": "contract IPriceFeed",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proxiableUUID",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "setEmergencyExit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "enum ReaperBaseStrategyv4.ExchangeType",
                        "name": "exType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "start",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "end",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum MinAmountOutKind",
                                "name": "kind",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "absoluteOrBPSValue",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct MinAmountOutData",
                        "name": "minAmountOutData",
                        "type": "tuple"
                    },
                    {
                        "internalType": "address",
                        "name": "exchangeAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct ReaperBaseStrategyv4.SwapStep",
                "name": "_newStep",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "setHarvestSwapStepAtIndex",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "enum ReaperBaseStrategyv4.ExchangeType",
                        "name": "exType",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "start",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "end",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum MinAmountOutKind",
                                "name": "kind",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "absoluteOrBPSValue",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct MinAmountOutData",
                        "name": "minAmountOutData",
                        "type": "tuple"
                    },
                    {
                        "internalType": "address",
                        "name": "exchangeAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct ReaperBaseStrategyv4.SwapStep[]",
                "name": "_newSteps",
                "type": "tuple[]"
            }
        ],
        "name": "setHarvestSwapSteps",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum ReaperBaseStrategyv4.ExchangeType",
                "name": "_exchange",
                "type": "uint8"
            }
        ],
        "name": "setUsdcToErnExchange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stabilityPool",
        "outputs": [
            {
                "internalType": "contract IStabilityPool",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "swapSteps",
        "outputs": [
            {
                "internalType": "enum ReaperBaseStrategyv4.ExchangeType",
                "name": "exType",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "start",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "end",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "enum MinAmountOutKind",
                        "name": "kind",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "absoluteOrBPSValue",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct MinAmountOutData",
                "name": "minAmountOutData",
                "type": "tuple"
            },
            {
                "internalType": "address",
                "name": "exchangeAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "swapper",
        "outputs": [
            {
                "internalType": "contract ISwapper",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniV3TWAP",
        "outputs": [
            {
                "internalType": "contract IStaticOracle",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniV3TWAPPeriod",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniV3UsdcErnPool",
        "outputs": [
            {
                "internalType": "contract IUniswapV3Pool",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_compoundingFeeMarginBPS",
                "type": "uint256"
            }
        ],
        "name": "updateCompoundingFeeMarginBPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum ReaperStrategyStabilityPool.TWAP",
                "name": "_currentUsdcErnTWAP",
                "type": "uint8"
            }
        ],
        "name": "updateCurrentUsdcErnTWAP",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_ernMinAmountOutBPS",
                "type": "uint256"
            }
        ],
        "name": "updateErnMinAmountOutBPS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint32",
                "name": "_uniV3TWAPPeriod",
                "type": "uint32"
            }
        ],
        "name": "updateUniV3TWAPPeriod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_veloUsdcErnQuoteGranularity",
                "type": "uint256"
            }
        ],
        "name": "updateVeloUsdcErnQuoteGranularity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "upgradeProposalTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            }
        ],
        "name": "upgradeTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "upgradeToAndCall",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdc",
        "outputs": [
            {
                "internalType": "contract IERC20MetadataUpgradeable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdcToErnExchange",
        "outputs": [
            {
                "internalType": "enum ReaperBaseStrategyv4.ExchangeType",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "vault",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "veloUsdcErnPool",
        "outputs": [
            {
                "internalType": "contract IVelodromePair",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "veloUsdcErnQuoteGranularity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "want",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "loss",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const