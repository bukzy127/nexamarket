export const NEXA_MARKET_ACCESS_ABI = [
  { inputs: [], name: "ProjectExists", type: "error" },
  { inputs: [], name: "ProjectNotFound", type: "error" },
  { inputs: [], name: "Unauthorized", type: "error" },
  { inputs: [], name: "IncorrectPayment", type: "error" },
  { inputs: [], name: "OwnerCannotBuyOwnProject", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "projects",
    outputs: [
      { internalType: "address payable", name: "owner", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "string", name: "metadataRef", type: "string" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
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
