export const GuardBadgeABI = [
  { "inputs": [{"internalType":"string","name":"uri_","type":"string"}], "stateMutability":"nonpayable", "type":"constructor" },
  { "inputs": [], "name": "BADGE_FIRST_SUBMIT", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "BADGE_TOP_SUPPORT", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "BADGE_ACTIVE_HELPER", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}], "name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}], "name":"mintBatch","outputs":[],"stateMutability":"nonpayable","type":"function" },
  { "inputs": [{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}], "name":"balanceOf","outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" }
];




