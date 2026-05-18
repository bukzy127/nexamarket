export const NEXA_MARKET_ACCESS_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "string", name: "metadataRef", type: "string" },
    ],
    name: "registerProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "projectId", type: "uint256" }],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "projectId", type: "uint256" },
      { internalType: "address", name: "wallet", type: "address" },
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
