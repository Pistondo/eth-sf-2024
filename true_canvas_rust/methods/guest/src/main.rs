use risc0_zkvm::guest::env;
use true_canvas_core::{
    deserialize_merkle_tree,
    serialize_merkle_tree,
    process_canvas_changes,
    CANVAS_SIZE,
};

type SerializedMerkleTree = Vec<Vec<Vec<u8>>>;

fn main() {
    // TODO: Implement your guest code here

    // read the input
    let serialized_merkle_tree: SerializedMerkleTree = env::read();
    // deserialize the input 
    let mut merkle_tree = deserialize_merkle_tree(serialized_merkle_tree);

    // Calculate the sum of all elements in input2
    let commands = env::read();

    process_canvas_changes(CANVAS_SIZE, &mut merkle_tree, commands);

    let updated_serialized_merkle_tree = serialize_merkle_tree(merkle_tree);
    env::commit(&updated_serialized_merkle_tree);
}
