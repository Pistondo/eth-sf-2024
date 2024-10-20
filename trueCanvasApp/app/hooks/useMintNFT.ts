import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getContract } from 'viem';
import { ZKP_VERIFIED_NFT_CONTRACT_ABI } from '@/app/abi/ZKPVerifiedNFTABI';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { CONTRACT_ADDRESSES } from '../config/contractAddresses';
import { PublicClient } from 'viem';
import { evmNetworks } from '../config/evmNetworks';

export const useMintNFT = () => {
    const { primaryWallet } = useDynamicContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mintNFT = async (tokenURI: string) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
            setError('Wallet not connected');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const walletClient = await primaryWallet.getWalletClient();
            const publicClient = await primaryWallet.getPublicClient();
            const contractAddress = CONTRACT_ADDRESSES.polygonZKEVM as `0x${string}`;

            const contract = getContract({
                address: contractAddress,
                abi: ZKP_VERIFIED_NFT_CONTRACT_ABI,
                client: walletClient,
            });

            const imageUrl = "https://example.com/image.png";
            const proofStatus = "proven";
            const sourceHash = "sourceHashExample";
            const destHash = "destHashExample";
            const proof = ["proof1", "proof2", "proof3"];

            const hash = await contract.write.mintArtwork([
                imageUrl,
                proofStatus,
                sourceHash,
                destHash,
                proof,
            ]);

            console.log('Transaction hash:', hash);

            // Implement polling for transaction receipt
            const receipt = await waitForTransactionReceipt(publicClient, hash);
            const blockExplorerUrl = evmNetworks.find(network => network.chainId === 2442)?.blockExplorerUrls[0];
            console.log('Transaction successful: ', receipt);
            console.log('Block explorer URL: ', `${blockExplorerUrl}/tx/${receipt.transactionHash}`);
        } catch (err) {
            console.error('Minting failed:', err);
            setError('Minting failed');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to poll for transaction receipt
    const waitForTransactionReceipt = async (publicClient: PublicClient, hash: `0x${string}`, maxAttempts = 20) => {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const receipt = await publicClient.getTransactionReceipt({ hash });
                if (receipt) return receipt;
            } catch (error) {
                if ((error as Error).message.includes('could not be found')) {
                    // Transaction not mined yet, wait and retry
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                } else {
                    throw error; // Rethrow if it's a different error
                }
            }
        }
        throw new Error('Transaction receipt not found after maximum attempts');
    };

    return { mintNFT, loading, error };
};