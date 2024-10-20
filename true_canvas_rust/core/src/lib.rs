use serde::{Deserialize, Serialize};
use ark_ed_on_bls12_381::Fq; // Finite field for Poseidon hash
use ark_std::vec::Vec;
use ark_sponge::{poseidon::{PoseidonConfig, PoseidonSponge}, CryptographicSponge};
use ark_serialize::{CanonicalSerialize, CanonicalDeserialize};
use rand::Rng;


pub const CANVAS_SIZE: usize = 4;

// mod merkle_tree;
#[derive(Debug, Serialize, Deserialize)]
pub struct Command {
    action_type: String,
    pixels: Vec<Pixel>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Pixel {
    x: u32,
    y: u32,
    value: u32, // Colors can be represented as hexadecimal values which in hand are numbers
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Diff {
    actions: Vec<Command>,
}

pub type SerializedMerkleTree = Vec<Vec<Vec<u8>>>;

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


// We go through each action in the diff input and for each action, we go through each pixel in the action and update the merkle tree
pub fn process_canvas_changes(width: usize, merkle_tree: &mut MerkleTree, commands: Vec<Command>) {
    for command in commands {
        for pixel in command.pixels {
            let index = (pixel.y as usize) * (width as usize) + (pixel.x as usize);
            merkle_tree.update_leaf(index, Fq::from(pixel.value as u64));
        }
    }
}

// build merkle tree from pixel matrix
pub fn build_merkle_tree_from_pixels(pixels: Vec<Vec<u32>>) -> MerkleTree {
    let flattened_pixels: Vec<Fq> = pixels.into_iter()
        .flatten()
        .map(|pixel| Fq::from(pixel as u64))
        .collect();
    let mut merkle_tree = MerkleTree::new();

    merkle_tree.build_tree(flattened_pixels);
    merkle_tree
}

pub fn deserialize_merkle_tree(serialized_merkle_tree: SerializedMerkleTree) -> MerkleTree {
    let mut merkle_tree = MerkleTree::new();
    merkle_tree.levels = serialized_merkle_tree.into_iter()
        .map(|level| level.into_iter()
            .map(|element| Fq::deserialize_compressed(&*element).unwrap())
            .collect())
        .collect();
    merkle_tree
}

pub fn serialize_merkle_tree(merkle_tree: MerkleTree) -> SerializedMerkleTree {
    merkle_tree.levels.into_iter()
        .map(|level| level.into_iter()
            .map(|element| {
                let mut serialized = Vec::new();
                element.serialize_compressed(&mut serialized).unwrap();
                serialized
            })
            .collect())
        .collect()
}

pub fn generate_random_matrix(n: usize) -> Vec<Vec<u32>> {
    let mut rng = rand::thread_rng();
    let mut matrix = Vec::with_capacity(n);

    for _ in 0..n {
        let row: Vec<u32> = (0..n).map(|_| rng.gen()).collect();
        matrix.push(row);
    }

    matrix
}

pub fn generate_random_command(num_pixels: usize, canvas_size: usize) -> Command {
    let mut rng = rand::thread_rng();
    let action_types = vec!["draw", "erase"];
    
    Command {
        action_type: action_types[rng.gen_range(0..action_types.len())].to_string(),
        pixels: (0..num_pixels)
            .map(|_| Pixel {
                x: rng.gen_range(0..canvas_size) as u32,  // Assuming an n x n canvas
                y: rng.gen_range(0..canvas_size) as u32,
                value: rng.gen(),  // Random color
            })
            .collect(),
    }
}


pub fn generate_random_command_sequence(num_commands: usize, canvas_size: usize, max_num_pixel_changes: usize) -> Vec<Command> {
    let mut rng = rand::thread_rng();
    let mut commands = Vec::with_capacity(num_commands);

    for _ in 0..num_commands {
        let num_pixels = rng.gen_range(1..=max_num_pixel_changes);
        let command = generate_random_command(num_pixels, canvas_size);
        commands.push(command);
    }

    commands
}
