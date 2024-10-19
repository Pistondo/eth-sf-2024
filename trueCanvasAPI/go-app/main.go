package main

import (
	"crypto/sha256"
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
	"time"
)

const proverURL string = "https://example.com"

// Proof Structures
type ZKProof struct {
	SourceHash string   `json:"sourceHash"`
	DestHash   string   `json:"destHash"`
	Proof      []string `json:"proof"`
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
func callProver(imageID string) {
	res, err := http.Get(proverURL)
	if err != nil {
		log.Printf((err.Error()))
	}

	// Remove this once you're done testing.
	sleepDuration := time.Duration(rand.Intn(36)+25) * time.Second
	time.Sleep(sleepDuration)

	zkproof := ZKProof{
		SourceHash: GenerateRandomString(25),
		DestHash:   GenerateRandomString(25),
		Proof:      []string{GenerateRandomString(7), GenerateRandomString(7), GenerateRandomString(7)},
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

	go callProver(imageId)

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
