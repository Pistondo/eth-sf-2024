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

    // Define structures for G1 and G2 points
    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    G1Point vk_alpha;
    G2Point vk_beta;
    G2Point vk_gamma;
    G2Point vk_delta;
    G1Point[] vk_gamma_abc; // Array of G1Points

    struct ArtworkMetadata {
        string imageUrl;
        string proofStatus;
        ZKProof zkProof;
    }

    mapping(uint256 => ArtworkMetadata) private _artworkMetadata;

    // BN256 Field Modulus

    constructor() ERC721("ZKPVerifiedNFT", "ZKPNFT") Ownable(msg.sender) {
        vk_alpha = G1Point(
            uint256(1948273649102837465019273641092837465901823741092837465910283746128374),
            uint256(7482913746192837465019283746510928374651902837465102938746109283746123)
        );

        // Initialize vk_beta
        vk_beta = G2Point(
            [
                uint256(2837465019283746510293746109283746510298374651902837465910283746509123),
                uint256(8374651902837465019283746109283746510298374651902837465019283746109287)
            ],
            [
                uint256(4837264910293847651029374651092837465019283746510928374650912837465019),
                uint256(1938475610298374650192837465102938475610928374651029387465019283746510)
            ]
        );

        // Initialize vk_gamma
        vk_gamma = G2Point(
            [
                uint256(3928475610298374650192837465019283746510928374650192837465019283746510),
                uint256(5019283746510928374650192837465019283746510928374650192837465102938476)
            ],
            [
                uint256(912837465019283746510928374650192837465019283746510298374650192837465),
                uint256(9283746510928374650192837465019283746510928374650192837465019283746510)
            ]
        );

        // Initialize vk_delta
        vk_delta = G2Point(
            [
                uint256(7182938475610298374650192837465019283746510928374650192837465019283746),
                uint256(2819475610928374650192837465019283746510928374650192837465019283746501)
            ],
            [
                uint256(5647382910192837465019283746510928374650192837465019283746510928374650),
                uint256(1827364910928374650192837465019283746510928374650192837465102938475610)
            ]
        );

        // Initialize vk_gamma_abc
        vk_gamma_abc.push(G1Point(
            uint256(3981023746519283746510928374650192837465102938475610298374650192837465),
            uint256(2309183746510928374650192837465019283746510928374650192837465019283746)
        ));
        vk_gamma_abc.push(G1Point(
            uint256(1092837465019283746510928374650192837465102938475610298374650192837465),
            uint256(8472913746510928374650192837465019283746510928374650192837465019283746)
        ));
        vk_gamma_abc.push(G1Point(
            uint256(3479102837465019283746510928374650192837465102938475610298374650192837),
            uint256(5748392019283746510928374650192837465019283746510928374650192837465019)
        ));
    }

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
        ArtworkMetadata memory metadata = ArtworkMetadata(
            imageUrl,
            proofStatus,
            zkProof
        );
        _artworkMetadata[newTokenId] = metadata;
    }

    function getArtworkMetadata(
        uint256 tokenId
    ) public view returns (ArtworkMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _artworkMetadata[tokenId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return _artworkMetadata[tokenId].imageUrl;
    }

    // Function to verify the proof
function verifyProof(
        G1Point memory proofA,
        G2Point memory proofB,
        G1Point memory proofC,
        uint256[] memory publicInputs
    ) internal view returns (bool) {
        // Compute the linear combination vk_x
        G1Point memory vk_x = G1Point(0, 0);

        require(publicInputs.length + 1 == vk_gamma_abc.length, "Invalid number of public inputs");

        for (uint256 i = 0; i < publicInputs.length; i++) {
            // Multiply vk_gamma_abc[i + 1] by publicInputs[i] and add to vk_x
            G1Point memory temp = scalarMul(vk_gamma_abc[i + 1], publicInputs[i]);
            vk_x = addPoints(vk_x, temp);
        }

        vk_x = addPoints(vk_x, vk_gamma_abc[0]);

        // Prepare arrays for pairing check
        G1Point[] memory g1Points;
        G2Point[] memory g2Points;

        // Set the pairing inputs
        g1Points[0] = negate(proofA);
        g1Points[1] = vk_x;
        g1Points[2] = proofC;

        g2Points[0] = proofB;
        g2Points[1] = vk_gamma;
        g2Points[2] = vk_delta;

        // Perform pairing check
        return pairing(g1Points, g2Points);
    }


    function negate(G1Point memory p) internal pure returns (G1Point memory) {
        // Negation in G1: (x, -y mod p)
        uint256 FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        if (p.X == 0 && p.Y == 0) {
            return G1Point(0, 0);
        }
        return G1Point(p.X, FIELD_MODULUS - (p.Y % FIELD_MODULUS));
    }

    function addPoints(
        G1Point memory p1,
        G1Point memory p2
    ) internal view returns (G1Point memory r) {
        // Use EVM precompile for point addition (address 0x06)
        uint256[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(gas(), 0x06, input, 0x80, r, 0x40)
        }
        require(success, "G1 point addition failed");
    }


    function scalarMul(
        G1Point memory p,
        uint256 s
    ) internal view returns (G1Point memory r) {
        // Use EVM precompile for point multiplication (address 0x07)
        uint256[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(gas(), 0x07, input, 0x60, r, 0x40)
        }
        require(success, "G1 scalar multiplication failed");
    }

    function pairing(
        G1Point[] memory g1Points,
        G2Point[] memory g2Points
    ) internal view returns (bool) {
        require(
            g1Points.length == g2Points.length,
            "Point arrays should be of equal length"
        );

        uint256 elements = g1Points.length;
        uint256 inputSize = elements * 6;
        uint256[] memory input = new uint256[](inputSize);

        for (uint256 i = 0; i < elements; i++) {
            // G1 points
            input[i * 6 + 0] = g1Points[i].X;
            input[i * 6 + 1] = g1Points[i].Y;
            // G2 points
            input[i * 6 + 2] = g2Points[i].X[0];
            input[i * 6 + 3] = g2Points[i].X[1];
            input[i * 6 + 4] = g2Points[i].Y[0];
            input[i * 6 + 5] = g2Points[i].Y[1];
        }

        uint256[1] memory out;
        bool success;
        assembly {
            success := staticcall(
                gas(),
                0x08,
                add(input, 0x20),
                mul(inputSize, 0x20),
                out,
                0x20
            )
        }
        require(success, "Pairing operation failed");
        return out[0] != 0;
    }
}
