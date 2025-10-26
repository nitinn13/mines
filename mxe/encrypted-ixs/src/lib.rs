// use arcis_imports::*;

// #[encrypted]
// mod circuits {
//     use arcis_imports::*;

//     pub struct InputValues {
//         pub choice: u8,
//     }

//     #[instruction]
//     pub fn mine(input_ctxt: Enc<Shared, InputValues>) -> bool {
//         let input = input_ctxt.to_arcis();

//         let mut bomb: u8 = 0;
//         let mut weight: u8 = 1;

//         for _ in 0..4 {
//             let bit = ArcisRNG::bool() as u8;
//             bomb = bomb + (bit * weight);
//             weight = weight * 2;
//         }

//         // Restrict range to 0–9
//         bomb = bomb % 10;
//         // true => player loses (hit bomb)
//         // false => player wins (safe tile)
//         let result = input.choice == bomb;

//         result.reveal()
//     }
// }

use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    pub struct InputValues {
        pub choice: u8,
    }

    #[instruction]
    pub fn mine(input_ctxt: Enc<Shared, InputValues>) -> bool {
        let input = input_ctxt.to_arcis();

        let mut bomb1: u8 = 0;
        let mut bomb2: u8 = 0;
        let mut bomb3: u8 = 0;

        // generate bomb1
        let mut weight: u8 = 1;
        for _ in 0..4 {
            let bit = ArcisRNG::bool() as u8;
            bomb1 += bit * weight;
            weight *= 2;
        }
        bomb1 = (bomb1 % 9) + 1;
        // let bomb1 = 3;

        // generate bomb2
        weight = 1;
        for _ in 0..4 {
            let bit = ArcisRNG::bool() as u8;
            bomb2 += bit * weight;
            weight *= 2;
        }
        bomb2 = (bomb2 % 9) + 1;

        // generate bomb3
        weight = 1;
        for _ in 0..4 {
            let bit = ArcisRNG::bool() as u8;
            bomb3 += bit * weight;
            weight *= 2;
        }
        bomb3 = (bomb3 % 9) + 1;

        // true => player loses (hit any bomb)
        let result = (input.choice == bomb1) | (input.choice == bomb2) | (input.choice == bomb3);

        result.reveal()
    }
}
