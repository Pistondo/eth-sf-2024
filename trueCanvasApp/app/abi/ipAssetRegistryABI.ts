
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPAssetRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const ipAssetRegistryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "erc6551Registry", internalType: "address", type: "address" },
      { name: "ipAccountImpl", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "error",
    inputs: [{ name: "authority", internalType: "address", type: "address" }],
    name: "AccessManagedInvalidAuthority",
  },
  {
    type: "error",
    inputs: [
      { name: "caller", internalType: "address", type: "address" },
      { name: "delay", internalType: "uint32", type: "uint32" },
    ],
    name: "AccessManagedRequiredDelay",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "AccessManagedUnauthorized",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [{ name: "implementation", internalType: "address", type: "address" }],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EnforcedPause" },
  { type: "error", inputs: [], name: "ExpectedPause" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "IPAccountRegistry_ZeroERC6551Registry" },
  { type: "error", inputs: [], name: "IPAccountRegistry_ZeroIpAccountImpl" },
  { type: "error", inputs: [], name: "IPAssetRegistry__AlreadyRegistered" },
  {
    type: "error",
    inputs: [
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "IPAssetRegistry__InvalidToken",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721",
  },
  {
    type: "error",
    inputs: [{ name: "contractAddress", internalType: "address", type: "address" }],
    name: "IPAssetRegistry__UnsupportedIERC721Metadata",
  },
  { type: "error", inputs: [], name: "IPAssetRegistry__ZeroAccessManager" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "length", internalType: "uint256", type: "uint256" },
    ],
    name: "StringsInsufficientHexLength",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "authority",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AuthorityUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPAccountRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "ipId",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "chainId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "tokenContract",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "tokenId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      { name: "name", internalType: "string", type: "string", indexed: false },
      { name: "uri", internalType: "string", type: "string", indexed: false },
      {
        name: "registrationDate",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "IPRegistered",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Paused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "Unpaused",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    type: "function",
    inputs: [],
    name: "ERC6551_PUBLIC_REGISTRY",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_IMPL",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "IP_ACCOUNT_SALT",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "__ProtocolPausable_init",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "authority",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getIPAccountImpl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "accessManager", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipAccount",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "ipId",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "isConsumingScheduledOp",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "address", type: "address" }],
    name: "isRegistered",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "paused",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "chainid", internalType: "uint256", type: "uint256" },
      { name: "tokenContract", internalType: "address", type: "address" },
      { name: "tokenId", internalType: "uint256", type: "uint256" },
    ],
    name: "register",
    outputs: [{ name: "id", internalType: "address", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newAuthority", internalType: "address", type: "address" }],
    name: "setAuthority",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
] as const;

/**
 *
 */
export const ipAssetRegistryAddress = {
  1513: "0xe34A78B3d658aF7ad69Ff1EFF9012ECa025a14Be",
} as const;

/**
 *
 */
export const ipAssetRegistryConfig = {
  address: ipAssetRegistryAddress,
  abi: ipAssetRegistryAbi,
} as const;
