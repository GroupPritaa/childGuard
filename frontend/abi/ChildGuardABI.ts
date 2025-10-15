export const ChildGuardABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "descriptionHash", "type": "string" },
      { "internalType": "string", "name": "region", "type": "string" },
      { "internalType": "string", "name": "date", "type": "string" }
    ],
    "name": "submitAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [], "name": "totalSupports", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"badgeId","type":"uint256"}], "name": "claimBadge", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"badgeId","type":"uint256"},{"internalType":"address","name":"user","type":"address"}], "name": "badgeClaimed", "outputs": [{"internalType":"bool","name":"","type":"bool"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"badgeId","type":"uint256"}], "name": "isEligible", "outputs": [{"internalType":"bool","name":"eligible","type":"bool"},{"internalType":"uint256","name":"progress","type":"uint256"},{"internalType":"uint256","name":"target","type":"uint256"}], "stateMutability": "view", "type": "function" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "recordId", "type": "uint256" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "supported",
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "recordId", "type": "uint256" },
      { "internalType": "externalEuint32", "name": "incEnc", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "supportAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "recordId", "type": "uint256" }
    ],
    "name": "getAction",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "submitter", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "descriptionHash", "type": "string" },
          { "internalType": "string", "name": "region", "type": "string" },
          { "internalType": "string", "name": "date", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "euint32", "name": "supportCountEnc", "type": "bytes32" }
        ],
        "internalType": "struct ChildGuard.ActionRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getActions",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "submitter", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "descriptionHash", "type": "string" },
          { "internalType": "string", "name": "region", "type": "string" },
          { "internalType": "string", "name": "date", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "euint32", "name": "supportCountEnc", "type": "bytes32" }
        ],
        "internalType": "struct ChildGuard.ActionRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  { "inputs": [], "name": "totalRecords", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [ {"indexed": true, "internalType": "address", "name": "submitter", "type": "address" }, {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" } ], "name": "ActionSubmitted", "type": "event" },
  { "anonymous": false, "inputs": [ {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, {"indexed": true, "internalType": "address", "name": "supporter", "type": "address" } ], "name": "ActionSupported", "type": "event" }
];


