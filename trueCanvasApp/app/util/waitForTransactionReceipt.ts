import { PublicClient } from "viem";

    // Helper function to poll for transaction receipt
    export const waitForTransactionReceipt = async (publicClient: PublicClient, hash: `0x${string}`, maxAttempts = 20) => {
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