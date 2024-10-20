'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMintNFT } from '../hooks/useMintNFT';
import { useRegisterIPAsset } from '../hooks/useRegisterIPAsset';
import { evmNetworks } from '../config/evmNetworks';
interface ProofData {
  proofStatus: string;
  ZKproof?: {
    sourceHash: string;
    destHash: string;
    proof: string[];
    walrusURI: string;
  };
}

export default function Home() {
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [registrationTxHash, setRegistrationTxHash] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');

  const { mintNFT, loading: mintingLoading, error: mintingError, txExplorerUrl, mintedTokenId, mintedContractAddress, chainId } = useMintNFT();
  const { registerIPAsset, loading: registeringLoading, error: registeringError, registeredAddress } = useRegisterIPAsset();


  useEffect(() => {
    async function fetchProofData() {
      if (imageId) {
        try {
          const response = await fetch(`https://truecanvas.uc.r.appspot.com/proof_status?imageID=${imageId}`);
          const data: ProofData = await response.json();
          setProofData(data);
        } catch (error) {
          console.error('Error fetching proof data:', error);
        }
      }
    }

    fetchProofData();
  }, [imageId]);

  const handleMintAndRegister = async (sourceHash: string, destHash: string, proof: string[], walrusURI: string) => {
    try {
      // Mint the NFT
      const mintResult = await mintNFT(sourceHash, destHash, proof, walrusURI);
      
      // Check if minting was successful
      if (!mintResult?.success) {
        console.error('Minting failed');
        return;
      }
  
      // Wait for a short period to ensure blockchain state is updated
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
  
      const storyProtocolChainId = evmNetworks[2].chainId;
      console.log('chainId', mintResult.chainId);
      console.log('storyProtocolChainId', storyProtocolChainId);
      console.log('mintedTokenId', mintResult.tokenId);
      console.log('mintedContractAddress', mintResult.contractAddress);
  
      if (mintResult.tokenId && mintResult.contractAddress && mintResult.chainId === storyProtocolChainId) {
        const { txHash } = await registerIPAsset(mintResult.contractAddress, mintResult.tokenId);
        setRegistrationTxHash(txHash);
        
        // Create an alert with the registration transaction URL
        const blockExplorerUrl = evmNetworks.find(network => network.chainId === mintResult.chainId)?.blockExplorerUrls[0];
        if (blockExplorerUrl && txHash) {
          const registrationTxUrl = `${blockExplorerUrl}/tx/${txHash}`;
          alert(`Registration successful! View transaction: ${registrationTxUrl}`);
        }
      } else {
        console.error('Registration conditions not met after minting');
      }
    } catch (error) {
      console.error('Error in mint and register process:', error);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundImage: `url(/page4.png)`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '2000px',
      }}
    >
      {proofData && (
        <div className="absolute top-8 right-8 bg-black bg-opacity-50 p-4 rounded-lg max-w-md">
          <button
            onClick={() => handleMintAndRegister(proofData.ZKproof?.sourceHash || '', proofData.ZKproof?.destHash || '', proofData.ZKproof?.proof || [], proofData.ZKproof?.walrusURI || '')}
            disabled={mintingLoading || registeringLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 w-full"
          >
            {mintingLoading ? 'Minting...' : registeringLoading ? 'Registering...' : 'Mint & Register NFT'}
          </button>
          {proofData.ZKproof?.walrusURI && <img src={proofData.ZKproof?.walrusURI} alt="NFT" width={200} height={200} />}
          {/* {proofData.ZKproof?.walrusURI && <Image src={proofData.ZKproof?.walrusURI} alt="NFT" width={200} height={200} />} */}
          {mintingError && <p className="text-red-500 mt-4">{mintingError}</p>}
          {registeringError && <p className="text-red-500 mt-4">{registeringError}</p>}
          {txExplorerUrl && (
            <p className="mt-4 break-words overflow-hidden">
              Minting Transaction: <a href={txExplorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{txExplorerUrl}</a>
            </p>
          )}
          {registrationTxHash && (
            <p className="mt-4 break-words overflow-hidden">
              Registration Transaction: <a href={`${evmNetworks.find(network => network.chainId === chainId)?.blockExplorerUrls[0]}/tx/${registrationTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{registrationTxHash}</a>
            </p>
          )}
          {registeredAddress && (
            <p className="mt-4 break-words overflow-hidden">
              Registered Address: {registeredAddress}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
