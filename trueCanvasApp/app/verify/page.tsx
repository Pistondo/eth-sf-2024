'use client';

import { useState, useEffect, SetStateAction, Dispatch, } from 'react';
import { getFileContent } from '@/app/verify/fileUtils'
import { useVerifySubmission } from '@/app/hooks/useVerifySubmission';



const ArrowUpRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17L17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const NotarizeArt = (
  image: File | null,
  setImage: Dispatch<SetStateAction<File | null>>,
  workLogs: File | null,
  setWorkLogs: Dispatch<SetStateAction<File | null>>,
  handleSubmit: any
) => {
  const [isLogsButtonOpen, setLogsButtonOpen] = useState(false);
  return (
    <div className="text-white min-h-screen mt-[600px]">
      <div className="max-w-7xl mx-auto border border-zinc-500 rounded-3xl p-8 bg-slate-900/[.71]">
        <h1 className="text-5xl font-bold mb-16">Notarize Your Art</h1>
        <div className="flex flex-nowrap overflow-x-auto gap-8 pb-4">
          <div className="flex-1 min-w-[250px] space-y-4">
            <div className="space-y-2">
              <p className="text-[#F4FFA5] font-medium text-4xl">STEP 1</p>
              <h2 className="text-l font-bold leading-tight min-h-[60px]">UPLOAD SAVED ACTIONS OF YOUR DIGITAL ART</h2>
              <p className="text-sm text-[#888686] min-h-[40px]">ILLUSTRATOR: GO TO WINDOW &gt; ACTIONS &gt; SAVE ACTIONS &gt; ACTIONS.AIA</p>
            </div>
            <button
              className="w-full p-3 border border-gray-600 rounded flex justify-center items-center hover:bg-gray-900/[.90] transition-colors"
              onClick={() => document.getElementById('worklogs').click()} // Trigger the file input
            >
              {workLogs ? 'Done ✅' : 'ADD +'}
            </button>
            <input
              type="file"
              id="worklogs"
              accept=".txt"
              onChange={(e) => setWorkLogs(e.target.files?.[0] || null)}
              className="hidden"
            />

          </div>
          <div className="flex-1 min-w-[250px] space-y-4">
            <div className="space-y-2">
              <p className="text-[#F4FFA5] font-medium text-4xl">STEP 2</p>
              <h2 className="text-l font-bold leading-tight min-h-[60px]">UPLOAD YOUR VISUAL IMAGES</h2>
              <p className="text-sm text-[#888686] min-h-[40px]">YOUR DIGITAL ART VISUALIZATIONS</p>
            </div>
            <button
              className="w-full p-3 border border-gray-600 rounded flex justify-center items-center hover:bg-gray-900/[.90] transition-colors"
              onClick={() => document.getElementById('image').click()} // Trigger the file input
            >
              {image ? 'Done ✅' : 'ADD +'}
            </button>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="hidden"
            />

          </div>
          <div className="flex-1 min-w-[250px] flex flex-col justify-end">
            <button className="w-full p-3 bg-white text-black rounded flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors" onClick={() => handleSubmit()}>
              Upload! <ArrowUpRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProofStatusResponse {
  proofStatus: 'proven' | 'unproven' | 'failed';
  ZKproof?: ZKProofResponse;
}

interface ZKProofResponse {
  ZKproof?: {
    sourceHash: string;
    destHash: string;
    proof: string[];
    walrusURI?: string;
  };
}

export default function Verify() {
  const [image, setImage] = useState<File | null>(null);
  const [workLogs, setWorkLogs] = useState<File | null>(null);
  const { isLoading, error, success, submitVerification } = useVerifySubmission();
  const [imageId, setImageId] = useState<string | null>(null);
  const [proof, setProof] = useState<ZKProofResponse | null>(null);
  const [displayMsg, setDisplayMsg] = useState<string>('');

  const handleSubmit = async () => {
    if (image && workLogs) {
      setDisplayMsg('');
      setProof(null);
      let workLogsString = await getFileContent(workLogs)
      const result = await submitVerification(image, workLogsString);
    } else {
      setDisplayMsg('Please upload an image and work logs');
    }
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


    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [imageId, proof]);


  return (<div
    className="flex flex-col text-white p-4 pt-200"
    style={{
      backgroundImage: `url(/page2.png)`,
      backgroundSize: 'contain',
      backgroundPosition: '50% 0%', // Center horizontally, align to the top
      height: '3800px', // Fill the entire viewport height
    }}>
    {NotarizeArt(image, setImage, workLogs, setWorkLogs, handleSubmit)}
  </div>
  );
}
