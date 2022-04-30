use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
#[allow(unused_imports)]
use near_sdk::{env, near_bindgen};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]

pub struct Adoption {
    pub id: i32,
    pub parent: String,
    pub name: String,
    pub animal: String,
    pub last_time_fed: u64,
    pub total_times_fed: u128,
    pub minted_nft: bool,
}

impl Adoption {
    pub fn new(id: i32, name: String, animal: String) -> Self {
        Adoption {
            id,
            parent: env::signer_account_id(),
            name,
            animal,
            last_time_fed: env::block_timestamp(),
            total_times_fed: 1,
            minted_nft: false,
        }
    }
}