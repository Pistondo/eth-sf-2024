// verifier.ts

import * as fs from 'fs';
import { BigNumber } from 'bignumber.js';
import { buildBn128 } from 'snarkjs';
import { F1Field } from 'ffjavascript';

async function verifyProof(
    proof,
    publicSignals,
    vkJsonPath
) {
    // Load the verifying key from JSON
    const vkJson = JSON.parse(fs.readFileSync(vkJsonPath, 'utf8'));

    // Initialize the finite field with the field modulus
    const Fr = new F1Field(vkJson.FIELD_MODULUS);

    // Build bn128 curve
    const bn128 = await buildBn128();

    // Convert the verifying key elements to the required format
    const vk_alpha_1 = [vkJson.vk_alpha.X, vkJson.vk_alpha.Y].map(BigInt);
    const vk_beta_2 = [
        [vkJson.vk_beta.X[0], vkJson.vk_beta.X[1]].map(BigInt),
        [vkJson.vk_beta.Y[0], vkJson.vk_beta.Y[1]].map(BigInt)
    ];
    const vk_gamma_2 = [
        [vkJson.vk_gamma.X[0], vkJson.vk_gamma.X[1]].map(BigInt),
        [vkJson.vk_gamma.Y[0], vkJson.vk_gamma.Y[1]].map(BigInt)
    ];
    const vk_delta_2 = [
        [vkJson.vk_delta.X[0], vkJson.vk_delta.X[1]].map(BigInt),
        [vkJson.vk_delta.Y[0], vkJson.vk_delta.Y[1]].map(BigInt)
    ];
    const vk_gamma_abc = vkJson.vk_gamma_abc.map((point) => {
        return [BigInt(point.X), BigInt(point.Y)];
    });

    // Compute vk_x
    let vk_x = [BigInt(0), BigInt(0)];
    vk_x = bn128.G1.add(vk_x, vk_gamma_abc[0]);
    for (let i = 0; i < publicSignals.length; i++) {
        const coef = BigInt(publicSignals[i]);
        const mulPoint = bn128.G1.mulScalar(vk_gamma_abc[i + 1], coef);
        vk_x = bn128.G1.add(vk_x, mulPoint);
    }

    // Prepare the proof elements
    const proofA = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const proofB = [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])]
    ];
    const proofC = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    // Perform the pairing check
    const isValid = bn128.pairingEq(
        [
            bn128.G1.neg(proofA),
            vk_alpha_1,
            vk_x,
            proofC
        ],
        [
            proofB,
            vk_beta_2,
            vk_gamma_2,
            vk_delta_2
        ]
    );

    return isValid;
}


