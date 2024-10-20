'use client';

import { useState, FormEvent, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { useVerifySubmission } from '@/app/hooks/useVerifySubmission';
import { useMintNFT } from '@/app/hooks/useMintNFT';

interface ProofStatusResponse {
  proofStatus: 'proven' | 'unproven' | 'failed';
  ZKproof?: ZKProofResponse;
}

interface ZKProofResponse {
  ZKproof?: {
    sourceHash: string;
    destHash: string;
    proof: string[];
  };
}

export default function Verify() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const { isLoading, error, success, submitVerification } = useVerifySubmission();
  const [imageId, setImageId] = useState<string | null>(null);
  const [proof, setProof] = useState<ZKProofResponse | null>(null);
  const [displayMsg, setDisplayMsg] = useState<string>('');
  const [waitingTime, setWaitingTime] = useState<number>(0);

  const { mintNFT, loading: mintingLoading, error: mintingError } = useMintNFT();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (image && text) {
      setDisplayMsg('');
      setWaitingTime(0);
      setProof(null);
      const result = await submitVerification(image, text);
      if (result?.imageId) {
        setImageId(result.imageId);
      }
    } else {
      setDisplayMsg('Please upload an image and enter text');
    }
  };

  const handleMint = async () => {
    // if (proof) {
      // const { sourceHash, destHash, proof: proofArray } = proof;
      // await mintNFT("https://example.com/image.png", "proven", sourceHash, destHash, proofArray);
      await mintNFT("sample");
    // }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let startTime: number;

    const checkProofStatus = async () => {
      if (imageId) {
        try {
          console.log(`Checking proof status for imageId: ${imageId}`);
          const response = await fetch(`https://truecanvas.uc.r.appspot.com/proof_status?imageID=${imageId}`);

          const data: ProofStatusResponse = await response.json();
          if (data.proofStatus === 'proven') {
            console.log('here is the data');
            console.log(data);
            setProof(data.ZKproof || null);
            clearInterval(intervalId);
          } else if (data.proofStatus === 'failed') {
            setDisplayMsg('Proof generation failed');
            clearInterval(intervalId);
          } else {
            // Update waiting time
            setWaitingTime(Math.floor((Date.now() - startTime) / 1000));
          }
        } catch (error) {
          setDisplayMsg(`Error checking proof status: ${JSON.stringify(error)}`);
          setWaitingTime(Math.floor((Date.now() - startTime) / 1000));
          // Don't clear the interval here, let it keep trying
          clearInterval(intervalId);
        }
      }
    };

    if (imageId && !proof) {
      startTime = Date.now();
      intervalId = setInterval(checkProofStatus, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [imageId, proof]);

  return (
    <PageLayout title="Verify">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Text
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Verification submitted successfully!</p>}
      {imageId && <p className="text-blue-500 mt-4">Waiting for proof generation for imageId {imageId}... for {waitingTime} seconds</p>}
      {proof && <p className="text-green-500 mt-4">Proof received: {JSON.stringify(proof)}</p>}
      {displayMsg && <p className="text-black mt-4">{displayMsg}</p>}
      {proof && (
        <button
          onClick={handleMint}
          disabled={mintingLoading}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
        >
          {mintingLoading ? 'Minting...' : 'Mint NFT'}
        </button>
      )}
      {mintingError && <p className="text-red-500 mt-4">{mintingError}</p>}
    </PageLayout>
  );
}
