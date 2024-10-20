# eth-sf-2024
Winning prizes


## Walrus
Walrus is used as decentralized storage for the images that are being processed and verified in this application.
- The images are uploaded to Walrus.
- The resulting Blob ID is used to create a URI that can be used to retrieve the image later.
- This URI is then included in the proof object, linking the proof to the specific image stored in Walrus.
- We also use the URI to mint an NFT, to the wallet used to generate the proof.

## Avail
TrueCanvas allows artists to showcase their art's authenticity via proofs, and this data must be highly available. Avail is a powerful chain-agnostic Data Availability layer which empowers this.
- We deploy ZK Stack Validium with Avail. ZK Stack provides a scalable and efficient platform for processing transactions, while Avail DA ensures that the data required for fraud proofs is available off-chain.

Avail Feedback (for Documentation Feedback): https://github.com/jeffreyyun/AvailFeedbackForEthSF2024
