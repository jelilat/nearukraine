mod models;
use crate::models::{
    Adoption,
};
#[allow(unused_imports)]
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::core::NonFungibleTokenCore;
use near_sdk::{borsh::{self, BorshDeserialize, BorshSerialize}, Promise};
use near_sdk::json_types::ValidAccountId;
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault};
use near_sdk::collections::LazyOption;
near_sdk::setup_alloc!();  

pub const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000 as u128;
pub const MAX_CAT_WEIGHT: u128 = 50 as u128;
pub const MAX_DOG_WEIGHT: u128 = 100 as u128;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    adoptions: Vec<Adoption>,
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";


#[near_bindgen]
impl Contract {
    // #[init]
    // pub fn init(
    //     owner: AccountId,
    // ) -> Self{
    //     let adoptions: Vec<Adoption> = Vec::new();

    //     Contract{
    //         owner,
    //         adoptions,
    //         tokens,
            // NFTContractMetadata {
            //     spec: NFT_METADATA_SPEC.to_string(),
            //     name: "Ukranian Zoo".to_string(),
            //     symbol: "$UKRAINEZOO".to_string(),
            //     icon: Some(DATA_IMAGE_SVG_NEAR_ICON),
            //     base_uri: None,
            //     reference: None,
            //     reference_hash: None,
            //  },
    //     }
    // }

    #[init]
    pub fn new(owner_id: ValidAccountId) -> Self {
        Self {
            adoptions: Vec::new(),
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval)
             ),
             metadata: LazyOption::new(
                StorageKey::Metadata,
                Some(&NFTContractMetadata {
                    spec: NFT_METADATA_SPEC.to_string(),
                    name: "Ukranian Zoo".to_string(),
                    symbol: "$UKRAINEZOO".to_string(),
                    icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                    base_uri: None,
                    reference: None,
                    reference_hash: None,
                 },)
             ),
        }
    }

    pub fn nft_mint(
        &mut self,
        token_id: u128,
        image: String,
        receiver_id: ValidAccountId,
    ) -> Token {
        let adoption: Adoption = self.adoptions.get(token_id as usize).unwrap().clone();

        let parent = adoption.parent;
        assert!(parent == env::signer_account_id(), "Only parent can claim NFT");

        assert!(adoption.minted_nft == false, "NFT already claimed");

        let timedifference = (env::block_timestamp() - adoption.last_time_fed) / (86_400 as u64);
        let mut weight = adoption.total_times_fed/(timedifference as u128);
        if weight > MAX_CAT_WEIGHT && adoption.animal == "cat" {
            weight = MAX_CAT_WEIGHT;
        } else if weight > MAX_DOG_WEIGHT && adoption.animal == "dog" {
            weight = MAX_DOG_WEIGHT;
        }

        let mut new_weight = weight.to_string() + " pounds";
        new_weight.push_str(&adoption.animal.clone());

        let name = adoption.name.clone();

        let adopt: &mut Adoption = self.adoptions.get_mut(token_id as usize).unwrap();
        adopt.minted_nft = true;

        self.tokens.mint(
           token_id.to_string(),
           receiver_id,
           Some(TokenMetadata {
                title: Some(name),
                description: Some(new_weight),
                media: Some(image),
                copies: Some(1),
                expires_at: None,
                extra: None,
                issued_at: Some(env::block_timestamp().to_string()),
                media_hash: None,
                reference: None,
                reference_hash: None,
                starts_at: None,
                updated_at: None,
            })
        )
    }

    #[private]
    pub fn mint_helper(
        &mut self,
        token_id: TokenId,
        receiver_id: ValidAccountId,
        token_metadata: TokenMetadata,
    ) -> Token {
        self.tokens.mint(token_id, receiver_id, Some(token_metadata))
    }

    #[payable]
    pub fn adopt_pet(
        &mut self,
        name: String,
        animal: String,
    ) {
        assert!(env::attached_deposit() == ONE_NEAR, "Adoption fee is 1 NEAR");
        let mut id = self.adoptions.len() as i32;
        if id == 0 {
            id = id + 1;
        }

        let adoption = Adoption::new(id, name, animal);
        self.adoptions.push(adoption);
        Promise::new(env::predecessor_account_id()).transfer(ONE_NEAR);
        env::log("You have successfully adopted a pet!".as_bytes());
    }

    #[payable]
    pub fn feed_pet(
        &mut self,
        id: i32,
    ) {
        assert!(env::attached_deposit() == ONE_NEAR, "Feeding fee is 1 NEAR");
        let adoption: &mut Adoption = self.adoptions.get_mut(id as usize).unwrap();

        let parent = adoption.parent.clone();
        assert!(parent == env::signer_account_id(), "Only the parent can feed the pet");

        let total_times_fed = adoption.total_times_fed;
        let new_total_times_fed = total_times_fed + 1;

        let new_last_time_fed = env::block_timestamp();

        adoption.last_time_fed = new_last_time_fed;
        adoption.total_times_fed = new_total_times_fed;
        Promise::new(env::predecessor_account_id()).transfer(ONE_NEAR);
        env::log("You have successfully fed your pet!".as_bytes());
    }

    
    pub fn get_adoption(
        &self,
        id: i32,
    ) -> Adoption {
        self.adoptions.get(id as usize).unwrap().clone()
    }

    
    pub fn get_adoptions(&self) -> Vec<Adoption> {
        self.adoptions.clone()
    }

    pub fn get_active_adoptions(&self) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            let status = adoption.minted_nft;
            let is_active = status == false;
            is_active
        }).map(|adoption| adoption.clone()).collect()
    }

    pub fn get_inactive_adoptions(&self) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            let status = adoption.minted_nft;
            let is_active = status == true;
            is_active
        }).map(|adoption| adoption.clone()).collect()
    }
    
    pub fn get_adoptions_count(&self) -> i32 {
        self.adoptions.len() as i32
    }

    
    pub fn get_adoptions_by_parent(&self, parent: AccountId) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }

    pub fn get_active_adoptions_by_parent(&self, parent: AccountId) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent && adoption.minted_nft == false
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }

    pub fn get_inactive_adoptions_by_parent(&self, parent: AccountId) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent && adoption.minted_nft == true
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }
    
    pub fn get_adoptions_by_animal(&self, animal: String) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.animal == animal
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }

    
    pub fn get_adoptions_by_parent_count(&self, parent: AccountId) -> i32 {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent
        }).count() as i32
    }

}