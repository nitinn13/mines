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

        let mut bomb: u8 = 0;
        let mut weight: u8 = 1;

        for _ in 0..4 {
            let bit = ArcisRNG::bool() as u8;
            bomb = bomb + (bit * weight);
            weight = weight * 2;
        }

        // Restrict range to 0–9
        bomb = bomb % 10;
        // true => player loses (hit bomb)
        // false => player wins (safe tile)
        let result = input.choice == bomb;

        result.reveal()
    }
}
