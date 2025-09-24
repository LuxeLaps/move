module playground::main {
    use std::signer;
    use aptos_framework::event;
    #[event]
    /// Event type for logging messages
    struct MessageEvent has drop, store {
        message: vector<u8>,
    }

    #[event]
    /// Event type for logging NFT related actions
    struct NFTEvent has drop, store {
        token_id: u64,
        message: vector<u8>,
    }

    /// NFT resource
    struct NFT has key {
        id: u64,
        creator: address,
        uri: vector<u8>,
    }

    /// Counter for unique NFT IDs
    struct NFTCounter has key {
        next_id: u64,
    }

    /// Balance resource stored under each account
    struct Balance has key {
        amount: u64,
    }

    /// Initialize NFT counter for an account
    public entry fun init(account: &signer) {
        move_to(account, NFTCounter { next_id: 0 });
    }

    /// Emit a simple hello event
    public entry fun hello() {
        event::emit(MessageEvent { message: b"Hello from Move!" });
    }

    /// Mint a new NFT to the caller
    public entry fun mint_nft(account: &signer, uri: vector<u8>) acquires NFTCounter {
        let creator_addr = signer::address_of(account);
        let counter_ref = borrow_global_mut<NFTCounter>(creator_addr);
        let token_id = counter_ref.next_id;
        counter_ref.next_id = token_id + 1;

        let nft = NFT {
            id: token_id,
            creator: creator_addr,
            uri,
        };
        move_to(account, nft);

        event::emit(NFTEvent { token_id, message: b"NFT Minted" });
    }

    /// Mint tokens to caller
    public entry fun mint_token(account: &signer, amount: u64) acquires Balance {
        let addr = signer::address_of(account);

        if (!exists<Balance>(addr)) {
            move_to(account, Balance { amount });
        } else {
            let bal_ref: &mut Balance = borrow_global_mut<Balance>(addr);
            bal_ref.amount = bal_ref.amount + amount;
        };

        event::emit(MessageEvent { message: b"Minted tokens" });
    }

    /// Transfer tokens between accounts
    public entry fun transfer_token(sender: &signer, recipient: &signer, amount: u64) acquires Balance {
        let sender_addr = signer::address_of(sender);

        // Deduct from sender
        let sender_bal: &mut Balance = borrow_global_mut<Balance>(sender_addr);
        assert!(sender_bal.amount >= amount, 1);
        sender_bal.amount = sender_bal.amount - amount;

        // Credit recipient
        let recipient_addr = signer::address_of(recipient);
        if (!exists<Balance>(recipient_addr)) {
            move_to(recipient, Balance { amount });
        } else {
            let rec_bal: &mut Balance = borrow_global_mut<Balance>(recipient_addr);
            rec_bal.amount = rec_bal.amount + amount;
        };

        // Emit transfer event
        event::emit(MessageEvent { message: b"Transfer complete" });
    }

    /// Transfer an NFT between accounts
    public entry fun transfer_nft(sender: &signer, recipient: &signer, token_id: u64) acquires NFT {
        let sender_addr = signer::address_of(sender);

        // Ensure sender owns the NFT
        assert!(exists<NFT>(sender_addr) && borrow_global<NFT>(sender_addr).id == token_id, 2);

        let nft = move_from<NFT>(sender_addr);
        move_to(recipient, nft);

        event::emit(NFTEvent { token_id, message: b"NFT Transferred" });
    }
}