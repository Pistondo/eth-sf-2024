# eth-sf-2024

Loom Demo Video: https://www.loom.com/share/0ea0bd1666f945b28442a18297a42250?sid=9852cbe6-3151-4d8b-8d7c-c440654a6668

## Technologies Used

### Story
Story Protocol fundamentally provides a way to register IP to provide providence as well as permissionless licensing for the IP. TrueArt extends the Story Protocol, particularly Proof of Creativity, by enabling artists to easily provide Proof of Authenticity onto their artwork by enable artists to generate zk proofs that they drew their own artwork. This would also fall most creative use case as well as this is a novel approach to empower and influence IP ownership

### Nethermind
TrueCanvas is a unique and innovative solution that welcomes artists into the blockchain world by enabling them to export their logs of popular art software like Photoshop and Illustrator and then generate a proof of all the actions that occurred in those logs.

Constructing base proofs for verifying canvas state transitions using Risc Zero and then transforming them into recursive proofs with STARKs and KZG commitments ensures efficient, scalable, and succinct verification of artwork originality by chaining Merkle roots from one action to the next.

### Polygon
TrueCanvas offers artists a unique way for an artist to prove that the art that they created is not generated is not AI generated. TrueArt constructing base proofs for verifying canvas state transitions using Risc Zero and then transforming them into recursive proofs with STARKs and finally using KZG commitments to make a succinct proof that other people can verify easily. People can now easily determine if a user generated an artwork by verifying the zk proof which lives inside the metadata field of a NFT on Polygon.

### Dynamic
TrueCanvas provides a unique and innovative way to bring crypto everywhere by encouraging artists to create their own Proof of Authenticity/Notarization. "Dynamic allows developers to craft magical onchain sign up experiences. They offer a suite of tools for effortless log in, wallet creation and user management. Dynamic was designed for users, and built for developers."
- We use Dynamic so users can connect their wallets across chains to TrueCanvas.

### Walrus
Walrus is used as decentralized storage for the images that are being processed and verified in TrueCanvas.
- The images are uploaded to Walrus.
- The resulting Blob ID is used to create a URI that can be used to retrieve the image later.
- This URI is then included in the proof object, linking the proof to the specific image stored in Walrus.
- We also use the URI to mint an NFT, to the wallet used to generate the proof.

### Avail
TrueCanvas allows artists to showcase their art's authenticity via proofs, and this data must be highly available. Avail is a powerful chain-agnostic Data Availability layer which empowers this.
- We deploy ZK Stack Validium with Avail. ZK Stack provides a scalable and efficient platform for processing transactions, while Avail DA ensures that the data required for fraud proofs is available off-chain.

Avail Feedback (for Documentation Feedback): https://github.com/Pistondo/eth-sf-2024/blob/main/avail/feedback.md
