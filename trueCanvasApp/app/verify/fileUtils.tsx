function fileToString(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // This event is triggered when the reading operation is successfully completed
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject('Error reading file as string');
            }
        };

        // Handle errors
        reader.onerror = () => {
            reject(reader.error);
        };

        // Read the file as a text string
        reader.readAsText(file);
    });
}

export async function getFileContent(file: File): Promise<string> {
    try {
        const result = await fileToString(file);
        console.log("File content as string:", result);
        return result
    } catch (error) {
        console.error("Error reading file:", error);
        throw error
    }
}


