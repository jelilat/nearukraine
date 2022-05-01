use crate::*;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn nft_mint(
        &mut self,
        token_id: TokenId,
        u_token_id: u128,
        receiver_id: AccountId,
        //we add an optional parameter for perpetual royalties
        perpetual_royalties: Option<HashMap<AccountId, u32>>,
    ) {
        let adoption: Adoption = self.adoptions.get(u_token_id as usize).unwrap().clone();

        let parent = adoption.parent;
        assert!(parent == env::signer_account_id().to_string(), "Only parent can claim NFT");

        assert!(adoption.minted_nft == false, "NFT already claimed");

        let timedifference = ((env::block_timestamp() - adoption.last_time_fed) / (86_400 as u64)) as f64;
        let mut weight = (adoption.total_times_fed as f64)/(timedifference);
        if weight > MAX_CAT_WEIGHT && adoption.animal == "cat" {
            weight = MAX_CAT_WEIGHT;
        } else if weight > MAX_DOG_WEIGHT && adoption.animal == "dog" {
            weight = MAX_DOG_WEIGHT;
        }

        let mut new_weight = (&(weight.to_string())[0..5]).to_string() + " " + "pounds";
        new_weight.push_str(&adoption.animal.clone());

        let name = adoption.name.clone();

        let adopt: &mut Adoption = self.adoptions.get_mut(u_token_id as usize).unwrap();
        adopt.minted_nft = true;

        let image;
        if adoption.animal == "cat" {
            image = CAT_IMAGE.to_string();
        } else {
            image = DOG_IMAGE.to_string();
        }

        let metadata = TokenMetadata {
            title: Some(name),
            description: Some(new_weight),
            media: Some(image),
            copies: Some(1),
            expires_at: None,
            extra: None,
            issued_at: Some(env::block_timestamp()),
            media_hash: None,
            reference: None,
            reference_hash: None,
            starts_at: None,
            updated_at: None,
        };

        //measure the initial storage being used on the contract
        let initial_storage_usage = env::storage_usage();

        // create a royalty map to store in the token
        let mut royalty = HashMap::new();

        // if perpetual royalties were passed into the function: 
        if let Some(perpetual_royalties) = perpetual_royalties {
            //make sure that the length of the perpetual royalties is below 7 since we won't have enough GAS to pay out that many people
            assert!(perpetual_royalties.len() < 7, "Cannot add more than 6 perpetual royalty amounts");

            //iterate through the perpetual royalties and insert the account and amount in the royalty map
            for (account, amount) in perpetual_royalties {
                royalty.insert(account, amount);
            }
        }

        //specify the token struct that contains the owner ID 
        let token = Token {
            //set the owner ID equal to the receiver ID passed into the function
            owner_id: receiver_id,
            //we set the approved account IDs to the default value (an empty map)
            approved_account_ids: Default::default(),
            //the next approval ID is set to 0
            next_approval_id: 0,
            //the map of perpetual royalties for the token (The owner will get 100% - total perpetual royalties)
            royalty,
        };

        //insert the token ID and token struct and make sure that the token doesn't exist
        assert!(
            self.tokens_by_id.insert(&token_id, &token).is_none(),
            "Token already exists"
        );

        //insert the token ID and metadata
        self.token_metadata_by_id.insert(&token_id, &metadata);

        //call the internal method for adding the token to the owner
        self.internal_add_token_to_owner(&token.owner_id, &token_id);

        //calculate the required storage which was the used - initial
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
        refund_deposit(required_storage_in_bytes);
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
        env::log_str("You have successfully adopted a pet!");
    }

    #[payable]
    pub fn feed_pet(
        &mut self,
        id: i32,
    ) {
        assert!(env::attached_deposit() == ONE_NEAR, "Feeding fee is 1 NEAR");
        let adoption: &mut Adoption = self.adoptions.get_mut(id as usize).unwrap();

        let parent = adoption.parent.clone();
        assert!(parent == env::signer_account_id().to_string(), "Only the parent can feed the pet");

        let total_times_fed = adoption.total_times_fed;
        let new_total_times_fed = total_times_fed + 1;

        let new_last_time_fed = env::block_timestamp();

        adoption.last_time_fed = new_last_time_fed;
        adoption.total_times_fed = new_total_times_fed;
        Promise::new(env::predecessor_account_id()).transfer(ONE_NEAR);
        env::log_str("You have successfully fed your pet!");
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

    
    pub fn get_adoptions_by_parent(&self, parent: String) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }

    pub fn get_active_adoptions_by_parent(&self, parent: String) -> Vec<Adoption> {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent && adoption.minted_nft == false
        }).map(|adoption| {
            adoption.clone()
        }).collect()
    }

    pub fn get_inactive_adoptions_by_parent(&self, parent: String) -> Vec<Adoption> {
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

    
    pub fn get_adoptions_by_parent_count(&self, parent: String) -> i32 {
        self.adoptions.iter().filter(|adoption| {
            adoption.parent == parent
        }).count() as i32
    }
}