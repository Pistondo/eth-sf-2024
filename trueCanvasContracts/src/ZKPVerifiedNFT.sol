// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKPVerifiedNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    bool private verified = false;

    struct ZKProof {
        string sourceHash;
        string destHash;
        string[3] proof;
    }

    struct ArtworkMetadata {
        string imageUrl;
        string proofStatus;
        ZKProof zkProof;
    }

    mapping(uint256 => ArtworkMetadata) private _artworkMetadata;

    constructor() ERC721("ZKPVerifiedNFT", "ZKPNFT") Ownable(msg.sender) {}

    function mintArtwork(
        string memory imageUrl,
        string memory proofStatus,
        string memory sourceHash,
        string memory destHash,
        string[3] memory proof
    ) public {
        require(bytes(imageUrl).length > 0, "Image URL cannot be empty");
        require(keccak256(abi.encodePacked(proofStatus)) == keccak256(abi.encodePacked("proven")), "Proof must be verified");

        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        _safeMint(msg.sender, newTokenId);
        
        ZKProof memory zkProof = ZKProof(sourceHash, destHash, proof);
        ArtworkMetadata memory metadata = ArtworkMetadata(imageUrl, proofStatus, zkProof);
        _artworkMetadata[newTokenId] = metadata;
    }

    function getArtworkMetadata(uint256 tokenId) public view returns (ArtworkMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _artworkMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return _artworkMetadata[tokenId].imageUrl;
    }
}