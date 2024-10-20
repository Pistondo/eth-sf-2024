import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getContract } from 'viem';
import { ipAssetRegistryAbi, ipAssetRegistryAddress } from '@/app/abi/ipAssetRegistryABI';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { PublicClient } from 'viem';
import { evmNetworks } from '../config/evmNetworks';
import { waitForTransactionReceipt } from '../util/waitForTransactionReceipt';

export const useRegisterIPAsset = () => {
    const { primaryWallet } = useDynamicContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registeredAddress, setRegisteredAddress] = useState<`0x${string}` | null>(null);

    const registerIPAsset = async (tokenContract: `0x${string}`, tokenId: bigint) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
            setError('Wallet not connected');
            return { txHash: null };
        }

        setLoading(true);
        setError(null);
        setRegisteredAddress(null);

        try {
            const walletClient = await primaryWallet.getWalletClient();
            const publicClient = await primaryWallet.getPublicClient();
            const chainId = await publicClient.getChainId();

            const contractAddress = ipAssetRegistryAddress[chainId as keyof typeof ipAssetRegistryAddress];
            if (!contractAddress) {
                throw new Error('Unsupported network');
            }

            const contract = getContract({
                address: contractAddress,
                abi: ipAssetRegistryAbi,
                client: walletClient,
            });

            const hash = await contract.write.register([
                BigInt(chainId),
                tokenContract,
                tokenId,
            ]);

            console.log('Registration transaction hash:', hash);

            const receipt = await waitForTransactionReceipt(publicClient, hash);
            console.log('Registration transaction successful: ', receipt);

            // Extract the registered address from the event logs
            const registeredEvent = receipt.logs.find(log => 
                log.topics[0] === '0x7d917fcbc9a29a9705ff9936ffa599500e4fd902e4486bae317414fe967b307c' // Registered event topic
            );
            if (registeredEvent && registeredEvent.data) {
                const registeredAddr = `0x${registeredEvent.data.slice(-40)}` as `0x${string}`;
                setRegisteredAddress(registeredAddr);
            }

            return { txHash: hash };

        } catch (err) {
            console.error('Registration failed:', err);
            setError('Registration failed');
            return { txHash: null };
        } finally {
            setLoading(false);
        }
    };

    return { registerIPAsset, loading, error, registeredAddress };
};