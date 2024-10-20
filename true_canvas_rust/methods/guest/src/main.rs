use risc0_zkvm::guest::env;

fn main() {
    // TODO: Implement your guest code here

    // read the input
    let input: Vec<u32> = env::read();
    

    // Calculate the sum of all elements in input2
    let sum: u32 = input.iter().sum();

    // Print the sum (this will be visible in the zkVM's stdout)

    // TODO: do something with the input

    // write public output to the journal
    env::commit(&sum);
}
