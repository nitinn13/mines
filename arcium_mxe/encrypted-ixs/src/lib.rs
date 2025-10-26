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

        let bomb = ArcisRNG::u8(10);

        // true => player loses (hit bomb)
        // false => player wins (safe tile)
        let result = input.choice == bomb;

        result.reveal()
    }
}
