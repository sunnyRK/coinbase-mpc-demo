import { Address } from "viem";

export const TOKENS = [
  {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
    decimals: 6,
  },
  {
    symbol: "USDT",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" as Address,
    decimals: 6,
  },
] as const; 