use serde::{Deserialize, Serialize};
use ark_ed_on_bls12_381::Fq; // Finite field for Poseidon hash
use ark_std::{rand::Rng, vec::Vec};
use ark_ff::PrimeField;
use ark_sponge::{poseidon::{PoseidonConfig, PoseidonSponge}, Absorb, CryptographicSponge};

#[derive(Debug, Serialize, Deserialize)]
struct Action {
    action_type: String,
    pixels: Vec<Pixel>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Pixel {
    x: u32,
    y: u32,
    value: u32, // Colors can be represented as hexadecimal values which in hand are numbers
}

#[derive(Debug, Serialize, Deserialize)]
struct Canvas {
    actions: Vec<Action>,
    final_state: Vec<Pixel>,
}

pub struct MerkleTree {
    pub levels: Vec<Vec<Fq>>, // Each level contains a vector of hashes
}

impl MerkleTree {
    pub fn new() -> Self {
        MerkleTree { levels: Vec::new() }
    }

    // Build the Merkle tree from leaf data
    pub fn build_tree(&mut self, data: Vec<Fq>) {
        let mut current_level = data;
        self.levels.push(current_level.clone());

        while current_level.len() > 1 {
            let mut next_level = Vec::new();
            for i in (0..current_level.len()).step_by(2) {
                let left = current_level[i];
                let right = if i + 1 < current_level.len() {
                    current_level[i + 1]
                } else {
                    // If odd number of elements, duplicate the last one
                    current_level[i]
                };
                let parent_hash = hash_two_elements(left, right);
                next_level.push(parent_hash);
            }
            self.levels.push(next_level.clone());
            current_level = next_level;
        }
    }

    // Add a leaf to the tree
    pub fn add_leaf(&mut self, leaf: Fq) {
        if self.levels.is_empty() {
            self.levels.push(vec![leaf]);
        } else {
            self.levels[0].push(leaf);
            // Rebuild the tree
            self.rebuild_tree();
        }
    }

    // Rebuild the tree after adding a leaf
    pub fn rebuild_tree(&mut self) {
        let data = self.levels[0].clone();
        self.levels.clear();
        self.build_tree(data);
    }

    // Get the Merkle root
    pub fn root(&self) -> Fq {
        self.levels.last().unwrap()[0]
    }

    // Generate a Merkle proof for a leaf at a given index
    pub fn generate_proof(&self, index: usize) -> Vec<Fq> {
        let mut proof = Vec::new();
        let mut idx = index;

        for level in &self.levels[..self.levels.len() - 1] {
            let sibling_idx = if idx % 2 == 0 { idx + 1 } else { idx - 1 };
            let sibling = if sibling_idx < level.len() {
                level[sibling_idx]
            } else {
                // If no sibling, duplicate the current node
                level[idx]
            };
            proof.push(sibling);
            idx /= 2;
        }
        proof
    }

    // Verify a Merkle proof
    pub fn verify_proof(root: Fq, leaf: Fq, proof: &[Fq], index: usize) -> bool {
        let mut computed_hash = leaf;
        let mut idx = index;

        for sibling in proof {
            if idx % 2 == 0 {
                computed_hash = hash_two_elements(computed_hash, *sibling);
            } else {
                computed_hash = hash_two_elements(*sibling, computed_hash);
            }
            idx /= 2;
        }
        computed_hash == root
    }


    pub fn update_leaf(&mut self, index: usize, new_leaf: Fq) {
        // Update the leaf
        if index >= self.levels[0].len() {
            panic!("Index out of bounds");
        }
        self.levels[0][index] = new_leaf;

        // Recompute hashes along the path to the root
        let mut idx = index;
        for level in 0..(self.levels.len() - 1) {
            let left_idx = if idx % 2 == 0 { idx } else { idx - 1 };
            let right_idx = if idx % 2 == 0 { idx + 1 } else { idx };

            let left = self.levels[level][left_idx];
            let right = if right_idx < self.levels[level].len() {
                self.levels[level][right_idx]
            } else {
                // Duplicate the left if no right sibling
                left
            };

            let parent_hash = hash_two_elements(left, right);
            idx /= 2;
            self.levels[level + 1][idx] = parent_hash;
        }
    }
}



// Hash function for two Fq elements using Poseidon
fn hash_two_elements(left: Fq, right: Fq) -> Fq {
    let params = PoseidonConfig::<Fq>::new(
        8,  // full_rounds
        57, // partial_rounds
        5,  // alpha (exponent)
        vec![vec![Fq::from(1); 3]; 3], // mds matrix (placeholder)
        vec![vec![Fq::from(0); 3]; 65], // ark (placeholder)
        2,  // rate
        1   // capacity
    );
    let mut sponge = PoseidonSponge::<Fq>::new(&params);
    sponge.absorb(&left); 
    sponge.absorb(&right); 
    sponge.squeeze_field_elements(1)[0]
}