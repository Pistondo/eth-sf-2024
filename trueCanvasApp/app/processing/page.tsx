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
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Get imageId from query params
    const urlParams = new URLSearchParams(window.location.search);
    const queryImageId = urlParams.get('imageId');
    if (queryImageId) {
      setImageId(queryImageId);
      // Optionally store in localStorage for future use
      localStorage.setItem('imageId', queryImageId);
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let startTime: number;

    const checkProofStatus = async () => {
      console.log(`imageId: ${imageId}`);
      if (imageId && imageId.startsWith("test")) {
        // For testing, just update the waiting time
        setWaitingTime(Math.floor((Date.now() - startTime) / 1000));
        // Simulate proof generation after 30 seconds
        if (waitingTime >= 30) {
          clearInterval(intervalId);
          // Redirect to the proven page
          router.push(`/proven?imageId=${imageId}`);
        }
      } else if (imageId) {
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
      };
    }

    if (imageId) {
      startTime = Date.now();
      intervalId = setInterval(checkProofStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [imageId, router]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prevDots => (prevDots.length >= 3 ? '' : prevDots + '>'));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center text-white p-8 min-h-screen"
      style={{
        backgroundImage: `url(/page_empty.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '2000px', // Fill the entire viewport height
      }}
    >
      <div className="w-full max-w-2xl bg-black bg-opacity-30 rounded-lg p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-4">Notarize Your Art</h2>

        <div className="bg-black bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xl">Processing</span>
            <span className="text-xl font-mono">{dots}</span>
          </div>

          {imageId && (
            <p className="text-sm text-blue-300 mt-2">
              Waiting for proof generation for imageId {imageId}... for {waitingTime} seconds
            </p>
          )}
          {displayMsg && <p className="text-sm text-white mt-2">{displayMsg}</p>}
        </div>
      </div>
      {/* Add a spacer div to ensure scrollability */}
      <div style={{ height: '80vh' }}></div>
    </div>
  );
}
