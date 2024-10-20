'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const router = useRouter();
  const [imageId, setImageId] = useState<string | null>(null);
  const [waitingTime, setWaitingTime] = useState<number>(0);
  const [displayMsg, setDisplayMsg] = useState<string>('');

  useEffect(() => {
    // Retrieve imageId from localStorage or query params
    const storedImageId = localStorage.getItem('imageId');
    if (storedImageId) {
      setImageId(storedImageId);
    } else {
      // Get imageId from query params
      const urlParams = new URLSearchParams(window.location.search);
      const queryImageId = urlParams.get('imageId');
      if (queryImageId) {
        setImageId(queryImageId);
        // Optionally store in localStorage for future use
        localStorage.setItem('imageId', queryImageId);
      }
    }
  }, []);

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
            clearInterval(intervalId);
            // Redirect to the proven page
            router.push(`/proven?imageId=${imageId}`);
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
          clearInterval(intervalId);
        }
      }
    };

    if (imageId) {
      startTime = Date.now();
      intervalId = setInterval(checkProofStatus, 6000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [imageId, router]);

  return (
    <div
      className="flex flex-col items-center justify-center text-white p-4 min-h-screen"
      style={{
        backgroundImage: `url(/page3.png)`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        minHeight: '100vh',
        height: 'auto',
      }}
    >
      <div className="bg-black bg-opacity-50 p-4 rounded-lg">
        {imageId && (
          <p className="text-blue-300 mb-2">
            Waiting for proof generation for imageId {imageId}... for {waitingTime} seconds
          </p>
        )}
        {displayMsg && <p className="text-white">{displayMsg}</p>}
      </div>
    </div>
  );
}
