'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMintNFT } from '../hooks/useMintNFT';

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
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imageId');

  const { mintNFT, loading: mintingLoading, error: mintingError, txExplorerUrl } = useMintNFT();


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

  const handleMint = async (sourceHash: string, destHash: string, proof: string[], walrusURI: string) => {
    await mintNFT(sourceHash, destHash, proof, walrusURI);
    // if (txExplorerUrl) {
    //   alert(`Transaction successful! View on block explorer: ${txExplorerUrl}`);
    // }
  };

  return (
    <div
      className="flex flex-col items-center justify-center text-white p-4"
      style={{
        backgroundImage: `url(/page4.png)`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '2000px', // Fill the entire viewport height
      }}
    >
      {proofData && (
        <div className="bg-black bg-opacity-50 p-4 rounded-lg">
          <button
            onClick={() => handleMint(proofData.ZKproof?.sourceHash || '', proofData.ZKproof?.destHash || '', proofData.ZKproof?.proof || [], proofData.ZKproof?.walrusURI || '')}
            disabled={mintingLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
          >
            {mintingLoading ? 'Minting...' : 'Mint NFT'}
          </button>
          {mintingError && <p className="text-red-500 mt-4">{mintingError}</p>}
        </div>
      )}
    </div>
  );
}