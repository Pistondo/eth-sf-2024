import { useState } from 'react';

interface VerifySubmissionState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useVerifySubmission() {
  const [state, setState] = useState<VerifySubmissionState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const submitVerification = async (image: File, text: string) => {
    setState({ isLoading: true, error: null, success: false });

    try {
      const imageBase64 = await fileToBase64(image);
        
      const response = await fetch('https://truecanvas.uc.r.appspot.com/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          logs: text, // Ensure this matches backend; previously it was "text"
        }),
      });

      console.log('response here: ', response);

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setState({ isLoading: false, error: null, success: true });
    } catch (error) {
      setState({ isLoading: false, error: (error as Error).message, success: false });
    }
  };

  return { ...state, submitVerification };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}