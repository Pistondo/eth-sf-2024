package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

const proverURL string = "https://example.com"

type VerifyRequest struct {
	Image string `json:"image"`
	Logs  string `json:"logs"`
}

type VerifyResponse struct {
	VerificationStatus string `json:"verificationStatus"`
	ImageID            string `json:imageID`
}

func allowAllOrigns(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

// HashString takes a string and returns its SHA-256 hash as a hexadecimal string.
func hashString(input string) string {
	hash := sha256.New()
	hash.Write([]byte(input))
	hashBytes := hash.Sum(nil)
	return hex.EncodeToString(hashBytes)
}

// indexHandler responds to requests with our greeting.
func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	allowAllOrigns(w)
	fmt.Fprint(w, "Hello, World!")
}

func getProofStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/proof_status" {
		http.NotFound(w, r)
		return
	}
	allowAllOrigns(w)
	fmt.Fprint(w, "Proof Status")
}

func verifyLogsAsLegitimate(logsText string) bool {
	copyCount := countWordOccurrences(logsText, "copy")
	pasteCount := countWordOccurrences(logsText, "paste")

	if (copyCount*4+pasteCount*5)/4 >= len(logsText) {
		return false
	}
	return true

}

func countWordOccurrences(text, word string) int {
	wordLen := len(word)
	count := 0

	// Normalize the text and word for case-insensitive comparison
	text = strings.ToLower(text)
	word = strings.ToLower(word)

	// Sliding window approach
	for i := 0; i <= len(text)-wordLen; i++ {
		// Extract the substring of the same length as the word
		substr := text[i : i+wordLen]
		if substr == word {
			count++
		}
	}

	return count
}

func postVerify(w http.ResponseWriter, r *http.Request) {
	var verifyRequest VerifyRequest
	json.NewDecoder(r.Body).Decode(&verifyRequest)

	fmt.Printf("Received Body: %s\n", verifyRequest.Image[:30])
	fmt.Printf("Received Body: %s\n", verifyRequest.Logs[:30])

	w.Header().Set("Content-Type", "application/json")
	allowAllOrigns(w)
	w.WriteHeader(http.StatusOK)

	verified := verifyLogsAsLegitimate(verifyRequest.Logs)
	if !verified {
		json.NewEncoder(w).Encode(VerifyResponse{
			VerificationStatus: "unverified",
			ImageID:            "",
		})
		return
	}

	go callProver()

	imageId := hashString(verifyRequest.Image)

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

// Async To Get Verify
func callProver() {
	res, err := http.Get(proverURL)
	if err != nil {
		log.Printf((err.Error()))
	}
	log.Printf("End line has been reached %d", res.StatusCode)
}

func main() {
	http.HandleFunc("/", (http.HandlerFunc(indexHandler)))
	http.HandleFunc("/proof_status", (http.HandlerFunc(getProofStatusHandler)))
	http.HandleFunc("/verify", (http.HandlerFunc(postVerify)))
	http.HandleFunc("/available_contracts", (http.HandlerFunc(getAvailableContracts)))

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
