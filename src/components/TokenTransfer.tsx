import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { parseUnits, encodeFunctionData, isAddress, getAddress } from "viem";
import { toast } from "react-toastify";
import { TOKENS } from "../constants/tokens";
import { useSendCalls, useCallsStatus } from "wagmi/experimental";
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// ERC20 transfer function ABI
const transferAbi = {
  name: 'transfer',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ type: 'bool' }]
} as const;

// Add type for token
type Token = typeof TOKENS[number];

export default function TokenTransfer() {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: balance } = useBalance({
    address,
    token: selectedToken.address,
  });

  const { sendCallsAsync, data: callsId, status: sendCallsStatus } = useSendCalls();
  const { data: callsStatus } = useCallsStatus({ 
    id: callsId as string
  });

  useEffect(() => {
    if (sendCallsStatus === 'pending') {
      setIsLoading(true);
    }

    if (callsStatus?.status === "CONFIRMED" && callsStatus.receipts?.[0]) {
      const txHash = callsStatus.receipts[0].transactionHash;
      setIsLoading(false);
      
      toast.success(
        <div>
          <span>Transfer successful!</span>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700 mt-1"
          >
            View: {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
      );

      // Clear form after successful transfer
      setAmount("");
      setRecipientAddress("");
    }
  }, [callsStatus, sendCallsStatus]);

  const handleTransfer = async () => {
    if (!amount || !recipientAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const parsedAmount = parseUnits(amount, selectedToken.decimals);
      
      if (balance && parsedAmount > balance.value) {
        toast.error("Insufficient balance");
        return;
      }
      
      if (!isAddress(recipientAddress)) {
        toast.error("Invalid recipient address");
        return;
      }

      const formattedAddress = getAddress(recipientAddress);

      const data = encodeFunctionData({
        abi: [transferAbi],
        args: [formattedAddress, parsedAmount],
        functionName: 'transfer',
      });

      const transferCall = {
        to: selectedToken.address,
        data,
        value: 0,
      };

      await sendCallsAsync({
        calls: [transferCall],
        capabilities: {
          paymasterService: {
            url: process.env.NEXT_PUBLIC_BASE_PAYMASTER,
          },
        },
      });

    } catch (error) {
      toast.error("Transfer failed: " + (error as Error).message);
      setIsLoading(false);
    }
  };

  // Format display balance with correct decimals
  const formatBalance = (balance?: { formatted: string }) => {
    if (!balance) return "0";
    return balance.formatted;
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-12rem)]">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Token Transfer
        </h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="token-select" className="block text-sm font-semibold text-gray-700 mb-2">
              Select Token
            </label>
            <select
              id="token-select"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={selectedToken.symbol}
              onChange={(e) => setSelectedToken(TOKENS.find(t => t.symbol === e.target.value)!)}
            >
              {TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - Balance: {formatBalance(balance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-16"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="any"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {selectedToken.symbol}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
              Balance: {formatBalance(balance)} {selectedToken.symbol}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTransfer}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
} 