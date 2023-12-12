export default [
    {
        type: "constructor",
        inputs: [
            {
                name: "_fee",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "allowance",
        inputs: [
            {
                name: "owner",
                type: "address",
                internalType: "address",
            },
            {
                name: "spender",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "approve",
        inputs: [
            {
                name: "spender",
                type: "address",
                internalType: "address",
            },
            {
                name: "value",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "creationTimestamp",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "data",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint8",
                internalType: "uint8",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "description",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "expiration",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "fee",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "finalize",
        inputs: [
            {
                name: "_result",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "finalized",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "initialize",
        inputs: [
            {
                name: "_params",
                type: "tuple",
                internalType: "struct InitializeKPITokenParams",
                components: [
                    {
                        name: "creator",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "oraclesManager",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "kpiTokensManager",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "feeReceiver",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "kpiTokenTemplateId",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "kpiTokenTemplateVersion",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "description",
                        type: "string",
                        internalType: "string",
                    },
                    {
                        name: "expiration",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "kpiTokenData",
                        type: "bytes",
                        internalType: "bytes",
                    },
                    {
                        name: "oraclesData",
                        type: "bytes",
                        internalType: "bytes",
                    },
                ],
            },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "oracles",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address[]",
                internalType: "address[]",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "address",
                internalType: "address",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "recoverERC20",
        inputs: [
            {
                name: "_token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_receiver",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "redeem",
        inputs: [
            {
                name: "_data",
                type: "bytes",
                internalType: "bytes",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "redeemCollateral",
        inputs: [
            {
                name: "_token",
                type: "address",
                internalType: "address",
            },
            {
                name: "_receiver",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "registerRedemption",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "string",
                internalType: "string",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "template",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "tuple",
                internalType: "struct Template",
                components: [
                    {
                        name: "addrezz",
                        type: "address",
                        internalType: "address",
                    },
                    {
                        name: "version",
                        type: "uint128",
                        internalType: "uint128",
                    },
                    {
                        name: "id",
                        type: "uint256",
                        internalType: "uint256",
                    },
                    {
                        name: "specification",
                        type: "string",
                        internalType: "string",
                    },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [
            {
                name: "",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "transfer",
        inputs: [
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "value",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "transferFrom",
        inputs: [
            {
                name: "from",
                type: "address",
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                internalType: "address",
            },
            {
                name: "value",
                type: "uint256",
                internalType: "uint256",
            },
        ],
        outputs: [
            {
                name: "",
                type: "bool",
                internalType: "bool",
            },
        ],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "transferOwnership",
        inputs: [
            {
                name: "_newOwner",
                type: "address",
                internalType: "address",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        name: "Approval",
        inputs: [
            {
                name: "owner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "spender",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "value",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "CollectProtocolFee",
        inputs: [
            {
                name: "token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "receiver",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Finalize",
        inputs: [],
        anonymous: false,
    },
    {
        type: "event",
        name: "Initialize",
        inputs: [
            {
                name: "creator",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "creationTimestamp",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "templateId",
                type: "uint256",
                indexed: true,
                internalType: "uint256",
            },
            {
                name: "templateVersion",
                type: "uint128",
                indexed: true,
                internalType: "uint128",
            },
            {
                name: "description",
                type: "string",
                indexed: false,
                internalType: "string",
            },
            {
                name: "expiration",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "oracles",
                type: "address[]",
                indexed: false,
                internalType: "address[]",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Initialized",
        inputs: [
            {
                name: "version",
                type: "uint64",
                indexed: false,
                internalType: "uint64",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            {
                name: "previousOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "newOwner",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RecoverERC20",
        inputs: [
            {
                name: "token",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
            {
                name: "receiver",
                type: "address",
                indexed: true,
                internalType: "address",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Redeem",
        inputs: [
            {
                name: "account",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "burned",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RedeemCollateral",
        inputs: [
            {
                name: "account",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "receiver",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "token",
                type: "address",
                indexed: false,
                internalType: "address",
            },
            {
                name: "amount",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RegisterRedemption",
        inputs: [
            {
                name: "account",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "burned",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Transfer",
        inputs: [
            {
                name: "from",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "to",
                type: "address",
                indexed: true,
                internalType: "address",
            },
            {
                name: "value",
                type: "uint256",
                indexed: false,
                internalType: "uint256",
            },
        ],
        anonymous: false,
    },
    {
        type: "error",
        name: "AddressEmptyCode",
        inputs: [
            {
                name: "target",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "AddressInsufficientBalance",
        inputs: [
            {
                name: "account",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "DuplicatedCollateral",
        inputs: [],
    },
    {
        type: "error",
        name: "ERC20InsufficientAllowance",
        inputs: [
            {
                name: "spender",
                type: "address",
                internalType: "address",
            },
            {
                name: "allowance",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "needed",
                type: "uint256",
                internalType: "uint256",
            },
        ],
    },
    {
        type: "error",
        name: "ERC20InsufficientBalance",
        inputs: [
            {
                name: "sender",
                type: "address",
                internalType: "address",
            },
            {
                name: "balance",
                type: "uint256",
                internalType: "uint256",
            },
            {
                name: "needed",
                type: "uint256",
                internalType: "uint256",
            },
        ],
    },
    {
        type: "error",
        name: "ERC20InvalidApprover",
        inputs: [
            {
                name: "approver",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC20InvalidReceiver",
        inputs: [
            {
                name: "receiver",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC20InvalidSender",
        inputs: [
            {
                name: "sender",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "ERC20InvalidSpender",
        inputs: [
            {
                name: "spender",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "FailedInnerCall",
        inputs: [],
    },
    {
        type: "error",
        name: "Forbidden",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidCollateral",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidCreator",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidDescription",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidExpiration",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidFee",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidFeeReceiver",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidInitialization",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidKpiTokensManager",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidMinimumPayoutAfterFee",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidName",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidOracleBounds",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidOracleWeights",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidOraclesManager",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidSymbol",
        inputs: [],
    },
    {
        type: "error",
        name: "InvalidTotalSupply",
        inputs: [],
    },
    {
        type: "error",
        name: "NoCollaterals",
        inputs: [],
    },
    {
        type: "error",
        name: "NoOracles",
        inputs: [],
    },
    {
        type: "error",
        name: "NotEnoughCollateral",
        inputs: [],
    },
    {
        type: "error",
        name: "NotEnoughValue",
        inputs: [],
    },
    {
        type: "error",
        name: "NotInitialized",
        inputs: [],
    },
    {
        type: "error",
        name: "NotInitializing",
        inputs: [],
    },
    {
        type: "error",
        name: "NothingToRecover",
        inputs: [],
    },
    {
        type: "error",
        name: "NothingToRedeem",
        inputs: [],
    },
    {
        type: "error",
        name: "ReentrancyGuardReentrantCall",
        inputs: [],
    },
    {
        type: "error",
        name: "SafeERC20FailedOperation",
        inputs: [
            {
                name: "token",
                type: "address",
                internalType: "address",
            },
        ],
    },
    {
        type: "error",
        name: "TooManyCollaterals",
        inputs: [],
    },
    {
        type: "error",
        name: "TooManyOracles",
        inputs: [],
    },
    {
        type: "error",
        name: "ZeroAddressOwner",
        inputs: [],
    },
    {
        type: "error",
        name: "ZeroAddressReceiver",
        inputs: [],
    },
    {
        type: "error",
        name: "ZeroAddressToken",
        inputs: [],
    },
] as const;
