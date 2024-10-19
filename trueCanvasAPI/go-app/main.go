package main
import (
	"fmt"
	"log"
	"net/http"
	"os"
)

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
	if r.URL.Path != "/verify" {
			http.NotFound(w, r)
			return
	}
	fmt.Fprint(w, "Proof Status")
}

func getAvailableContracts(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/available_contracts" {
			http.NotFound(w, r)
			return
	}
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