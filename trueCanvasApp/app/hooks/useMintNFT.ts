import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getContract } from 'viem';
import { ZKP_VERIFIED_NFT_CONTRACT_ABI } from '@/app/abi/ZKPVerifiedNFTABI';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { PublicClient } from 'viem';
import { evmNetworks } from '../config/evmNetworks';
import { waitForTransactionReceipt } from '../util/waitForTransactionReceipt';

export const useMintNFT = () => {
    const { primaryWallet } = useDynamicContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txExplorerUrl, setTxExplorerUrl] = useState<string | null>(null);
    const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
    const [mintedContractAddress, setMintedContractAddress] = useState<`0x${string}` | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    const mintNFT = async (sourceHash: string, destHash: string, proof: string[], walrusURI: string) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
            setError('Wallet not connected');
            return;
        }

        setLoading(true);
        setError(null);
        setTxExplorerUrl(null);

        try {
            const walletClient = await primaryWallet.getWalletClient();
            const publicClient = await primaryWallet.getPublicClient();
            const chainId = await publicClient.getChainId();
            setChainId(chainId);
            const network = evmNetworks.find(network => network.chainId === chainId);
            if (!network) {
                throw new Error('Unsupported network');
            }
            const contractAddress = network.contractAddresses as `0x${string}`;

            const contract = getContract({
                address: contractAddress,
                abi: ZKP_VERIFIED_NFT_CONTRACT_ABI,
                client: walletClient,
            });

            const proofStatus = "proven";

            const hash = await contract.write.mintArtwork([
                walrusURI,
                proofStatus,
                sourceHash,
                destHash,
                proof,
            ]);

            console.log('Transaction hash:', hash);

            // Implement polling for transaction receipt
            const receipt = await waitForTransactionReceipt(publicClient, hash);

            // Extract the minted token ID from the event logs
            const mintEvent = receipt.logs.find(log => 
                log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event topic
            );
            let tokenId: bigint | null = null;
            if (mintEvent && mintEvent.topics[3]) {
                tokenId = BigInt(mintEvent.topics[3]);
                setMintedTokenId(tokenId);
                setMintedContractAddress(contractAddress);
            }

            const blockExplorerUrl = evmNetworks.find(network => network.chainId === chainId)?.blockExplorerUrls[0];
            const explorerUrl = `${blockExplorerUrl}/tx/${receipt.transactionHash}`;
            setTxExplorerUrl(explorerUrl);
            console.log('Transaction successful: ', receipt);
            console.log('Block explorer URL: ', explorerUrl);
            alert(`Transaction successful! View on block explorer: ${explorerUrl}`);
            return { 
                success: true, 
                tokenId: tokenId, 
                contractAddress: contractAddress,
                chainId: chainId
            };
        } catch (err) {
            console.error('Minting failed:', err);
            setError('Minting failed');
            return { 
                success: false, 
                tokenId: null, 
                contractAddress: null,
                chainId: null
            };
        } finally {
            setLoading(false);
        }
    };

    return { mintNFT, loading, error, txExplorerUrl, mintedTokenId, mintedContractAddress, chainId };
};