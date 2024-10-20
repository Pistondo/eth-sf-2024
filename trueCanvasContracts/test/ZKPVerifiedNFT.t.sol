// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ZKPVerifiedNFT} from "../src/ZKPVerifiedNFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ZKPVerifiedNFTTest is Test, IERC721Receiver {
    ZKPVerifiedNFT public zkpVerifiedNFT;

    function setUp() public {
        zkpVerifiedNFT = new ZKPVerifiedNFT();
    }

    function test_Increment() public {
        zkpVerifiedNFT.mintArtwork("https://example.com/image.png", "proven", "sourceHash", "destHash", ["proof1", "proof2", "proof3"]);
        assertEq(zkpVerifiedNFT.balanceOf(address(this)), 1);
    }

    // Implement the onERC721Received function
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}