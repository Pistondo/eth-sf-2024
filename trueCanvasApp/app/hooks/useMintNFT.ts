import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { getContract } from 'viem';
import { ZKP_VERIFIED_NFT_CONTRACT_ABI } from '@/app/abi/ZKPVerifiedNFTABI';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { CONTRACT_ADDRESSES } from '../config/contractAddresses';

// Replace with your contract's ABI and address


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
      // Create a viem client
      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();

      const contractAddress = CONTRACT_ADDRESSES.polygonZKEVM as `0x${string}`

      // Create a contract instance
      const contract = getContract({
        address: contractAddress,
        abi: ZKP_VERIFIED_NFT_CONTRACT_ABI,
        client: walletClient,
      });

    // Prepare the data for minting
    const imageUrl = "https://example.com/image.png";
    const proofStatus = "proven";
    const sourceHash = "sourceHashExample";
    const destHash = "destHashExample";
    const proof = ["proof1", "proof2", "proof3"];

    // Call the mintArtwork function
    const hash = await contract.write.mintArtwork([
        imageUrl,
        proofStatus,
        sourceHash,
        destHash,
        proof,
      ]);
    
      console.log('here is the hash', hash);

      const receipt = await publicClient.getTransactionReceipt({
        hash,
      });

      console.log('Transaction successful: ', receipt);
    } catch (err) {
      console.error('Minting failed:', err);
      setError('Minting failed');
    } finally {
      setLoading(false);
    }
  };

  return { mintNFT, loading, error };
};
