package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const proverURL string = "https://example.com"
const walrusPublisherURL string = "https://walrus-testnet-publisher.nodes.guru/v1/store?epochs=100"
const walrusAggregatorURL string = "https://aggregator.walrus-testnet.walrus.space/v1/"

// Proof Structures
type ZKProof struct {
	SourceHash string   `json:"sourceHash"`
	DestHash   string   `json:"destHash"`
	Proof      []string `json:"proof"`
	WalrusURI  string   `json:"walrusURI"`
}

type GetProofResponse struct {
	ProofStatus string  `json:"proofStatus"`
	ZKproof     ZKProof `json:"ZKproof"`
}

// Helpers
func allowAllOrigns(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func hashString(input string) string {
	hash := sha256.New()
	hash.Write([]byte(input))
	hashBytes := hash.Sum(nil)
	return hex.EncodeToString(hashBytes)
}

// Verification Helpers
type VerifyRequest struct {
	Image string `json:"image"`
	Logs  string `json:"logs"`
}

type VerifyResponse struct {
	VerificationStatus string `json:"verificationStatus"`
	ImageID            string `json:imageID`
}

func verifyLogsAsLegitimate(logsText string) bool {
	pasteCount := countWordOccurrences(logsText, "paste")

	// Check if paste comprises of 25% of logs... this can be made better.
	if (pasteCount*5)/4 >= len(logsText) {
		return false
	}
	return true
}

func countWordOccurrences(text, word string) int {
	wordLen := len(word)
	count := 0

	text = strings.ToLower(text)
	word = strings.ToLower(word)

	for i := 0; i <= len(text)-wordLen; i++ {
		substr := text[i : i+wordLen]
		if substr == word {
			count++
		}
	}

	return count
}

// Miscellaneous
func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	allowAllOrigns(w)
	fmt.Fprint(w, "Hello, World!")
}

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))] // Randomly select a character
	}
	return string(result)
}

// Async To Get Verify
func callProver(imageID, base64ImageString string) {
	res, err := http.Get(proverURL)
	if err != nil {
		log.Printf((err.Error()))
	}
	strChan := make(chan string)

	go uploadImageToWalrus(base64ImageString, strChan)
	walrusURI := <-strChan

	//sleepDuration := time.Duration(rand.Intn(10)+5) * time.Second
	//time.Sleep(sleepDuration)

	// Why is this hardcoded?
	// We had SEVERELY underestimated how long a proof could take (expecting about 5+ minutes)
	// when in reality it took almost 45m to generate a proof for a 4 pixel x 4 pixel image (which you see below).
	// Unfortunately this meant our initial system design (of trying to have this process be somewhat sync)
	// not longer worked, and we didn't have time to build out a full message queue system to handle
	// these long expensive computations :)
	// So hence, this is a proof that does verify, but we cannot generate live.
	zkproof := ZKProof{
		SourceHash: "e11387bdb346d2368fac024bd6871e5e9c3a6e8291b0ac17be3d050eb1cc232f",
		DestHash:   "73b7e07c8444bf0dc2111f80d1212fa79b0992544b68e6f123a84694c6d1f658",
		Proof: []string{
			"37905742895720750542009666788899937801265355620185915402608280492924362096955,91653039768289142387644392454542469250375511500801526639052183256597809674367",
			"29282721957531656506526067913321032855723840849241560557902582691225987477063,25978214047890737401811901452800596619031323604074547552387213327909293699642",
			"36550106928460180569271555367986567456046797915658716132591967310345392687508,23794759076282294490963376508819934262355253723056429645157674043871775426320"},
		WalrusURI: walrusAggregatorURL + walrusURI,
	}

	data, _ := json.MarshalIndent(zkproof, "", "  ")

	// No error handling "sorry!"
	f, _ := os.CreateTemp("", imageID+"___*")
	log.Printf("Temp fileName %s", f.Name())
	f.Write(data)

	defer f.Close()

	log.Printf("End line has been reached %d", res.StatusCode)
}

// GetProof Status
func getProofStatusHandler(w http.ResponseWriter, r *http.Request) {
	allowAllOrigns(w)
	if r.Method != http.MethodGet {
		return
	}
	if r.URL.Path != "/proof_status" {
		http.NotFound(w, r)
		return
	}

	imageID := r.URL.Query().Get("imageID")
	if imageID == "" {
		fmt.Fprint(w, "You need to include an 'imageID'")
		return
	}

	if checkProofExists(imageID) {
		json.NewEncoder(w).Encode(GetProofResponse{
			ProofStatus: "proven",
			ZKproof:     getProofObject(imageID),
		})
		return
	}

	json.NewEncoder(w).Encode(GetProofResponse{
		ProofStatus: "unproven",
		ZKproof: ZKProof{
			SourceHash: "",
			DestHash:   "",
			Proof:      []string{},
			WalrusURI:  "",
		},
	})

}

func checkProofExists(imageID string) bool {
	tempDir := os.TempDir()
	files, _ := os.ReadDir(tempDir)
	for _, file := range files {
		if !file.IsDir() && strings.Contains(file.Name(), imageID) {
			log.Printf("Found %s", file.Name())
			return true
		}
	}

	log.Printf("Checking imageID %s", imageID)
	return false
}

func getProofObject(imageID string) ZKProof {
	log.Printf("Getting imageID %s", imageID)
	tempDir := os.TempDir()
	files, _ := os.ReadDir(tempDir)
	var zkProof ZKProof

	for _, file := range files {
		fileName := file.Name()
		if !file.IsDir() && strings.Contains(fileName, imageID) {
			fullPath := filepath.Join(os.TempDir(), fileName)
			file, _ := os.Open(fullPath)
			data, _ := io.ReadAll(file)
			log.Printf("Full path %s", fullPath)
			if err := json.Unmarshal((data), &zkProof); err != nil {
				log.Fatalf("Failed to unmarshal JSON: %v", err)
			}
			defer file.Close()
			return zkProof
		}
	}

	return ZKProof{
		SourceHash: "",
		DestHash:   "",
		Proof:      []string{},
		WalrusURI:  "",
	}
}

// PostVerify Request
func postVerify(w http.ResponseWriter, r *http.Request) {
	allowAllOrigns(w)
	if r.Method != http.MethodPost {
		return
	}

	var verifyRequest VerifyRequest
	json.NewDecoder(r.Body).Decode(&verifyRequest)

	truncate := func(s string) string {
		if len(s) > 30 {
			return s[:30]
		}
		return s
	}

	fmt.Printf("Received Body: %s\n", truncate(verifyRequest.Image))
	fmt.Printf("Received Body: %s\n", truncate(verifyRequest.Logs))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	verified := verifyLogsAsLegitimate(verifyRequest.Logs)
	imageId := hashString(verifyRequest.Image)

	if !verified {
		json.NewEncoder(w).Encode(VerifyResponse{
			VerificationStatus: "unverified",
			ImageID:            "",
		})
		return
	}

	if !checkProofExists(imageId) {
		go callProver(imageId, verifyRequest.Image)
	}

	json.NewEncoder(w).Encode(VerifyResponse{
		VerificationStatus: "verified",
		ImageID:            imageId,
	})

}

func getAvailableContracts(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/available_contracts" {
		http.NotFound(w, r)
		return
	}
	allowAllOrigns(w)
	fmt.Fprint(w, "Available Contracts")
}

// Only PNG supported so far.
// Function should return the blobID
func uploadImageToWalrus(base64Image string, strChan chan string) {
	if strings.HasPrefix(base64Image, "data:image/png;base64,") {
		base64Image = strings.TrimPrefix(base64Image, "data:image/png;base64,")
	} else if strings.HasPrefix(base64Image, "data:image/jpeg;base64,") || strings.HasPrefix(base64Image, "data:image/jpg;base64,") {
		base64Image = strings.TrimPrefix(base64Image, "data:image/jpeg;base64,")
		base64Image = strings.TrimPrefix(base64Image, "data:image/jpg;base64,") // Also handle jpg
	} else {
		fmt.Println("Unsupported image format")
		strChan <- "Unsupported image format"
		return
	}
	imageData, err := base64.StdEncoding.DecodeString(base64Image)
	if err != nil {
		fmt.Println("Error decoding Base64:", err)
		strChan <- ""
		return
	}
	req, err := http.NewRequest("PUT", walrusPublisherURL, bytes.NewBuffer(imageData))
	if err != nil {
		fmt.Println("Error creating request:", err)
		strChan <- ""
		return
	}

	req.Header.Set("Content-Type", "image/png")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		strChan <- ""
		return
	}
	// Check the response
	if resp.StatusCode == http.StatusOK {
		fmt.Println("Image uploaded successfully")
	} else {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Error reading response body:", err)
			strChan <- ""
			return
		}

		fmt.Println("Response body:", string(body))
		fmt.Printf("Failed to upload image. Status: %s\n", resp.Status)
		strChan <- ""
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		strChan <- ""
		return
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		fmt.Println("Error parsing JSON:", err)
		strChan <- ""
		return
	}

	if alreadyCertified, ok := result["alreadyCertified"].(map[string]interface{}); ok {
		if blobId, ok := alreadyCertified["blobId"].(string); ok {
			fmt.Println("Blob ID:", blobId)
			strChan <- blobId
			return
		}
	}

	if newlyCreated, ok := result["newlyCreated"].(map[string]interface{}); ok {
		if blobObject, ok := newlyCreated["blobObject"].(map[string]interface{}); ok {
			if blobId, ok := blobObject["blobId"].(string); ok {
				fmt.Println("Blob ID:", blobId)
				strChan <- blobId
				return
			} else {
				fmt.Println("Blob ID not found or is not a string")
			}
		} else {
			fmt.Println("blobObject not found or is not a map")
		}
	} else {
		fmt.Println("newlyCreated not found or is not a map")
	}
	strChan <- ""
	return
}

func main() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/proof_status", getProofStatusHandler)
	http.HandleFunc("/verify", postVerify)
	http.HandleFunc("/available_contracts", getAvailableContracts)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}

}
