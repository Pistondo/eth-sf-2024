package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type VerifyRequest struct {
	Image string `json:"image"`
	Logs  string `json:"logs"`
}

type VerifyResponse struct {
	VerificationStatus string `json:"verificationStatus"`
}

// indexHandler responds to requests with our greeting.
func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprint(w, "Hello, World!")
}

func getProofStatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/proof_status" {
		http.NotFound(w, r)
		return
	}
	fmt.Fprint(w, "Proof Status")
}

func postVerify(w http.ResponseWriter, r *http.Request) {
	var verifyRequest VerifyRequest
	json.NewDecoder(r.Body).Decode(&verifyRequest)

	fmt.Printf("Received Body: %s\n", verifyRequest.Image)
	fmt.Printf("Received Body: %s\n", verifyRequest.Logs)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(VerifyResponse{
		VerificationStatus: "verified",
	})

}

func getAvailableContracts(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/available_contracts" {
		http.NotFound(w, r)
		return
	}
	go callProver()
	fmt.Fprint(w, "Available Contracts")
}

// Async To Get Verify
func callProver() {
	res, err := http.Get("https://example.com")
	if err != nil {
		log.Printf((err.Error()))
	}
	log.Printf("End line has been reached %d", res.StatusCode)

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
