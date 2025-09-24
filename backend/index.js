require('dotenv').config();
const express = require('express');
const { Aptos, AptosConfig, Network } = require('@aptos-labs/ts-sdk');

const app = express();
app.use(express.json());

const APTOS_NETWORK = process.env.APTOS_NETWORK || Network.DEVNET;
const APTOS_NODE_URL = process.env.APTOS_NODE_URL || `https://fullnode.${APTOS_NETWORK}.aptoslabs.com/v1`;

const aptosConfig = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(aptosConfig);

const MODULE_ADDRESS = process.env.MODULE_ADDRESS;

// Helper function to generate a new account
app.post('/generate-account', (req, res) => {
    try {
        const account = Aptos.generateAccount();
        res.json({ address: account.accountAddress.toString(), privateKey: account.privateKey.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to fund an account
app.post('/fund-account', async (req, res) => {
    const { address, amount } = req.body;
    try {
        const faucetUrl = `https://faucet.${APTOS_NETWORK}.aptoslabs.com`;
        const response = await aptos.fundAccount({
            accountAddress: address,
            amount: amount,
            faucetUrl: faucetUrl,
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize the Move module for a given account
app.post('/init-module', async (req, res) => {
    const { privateKey } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::init`,
                functionArguments: [],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Call the hello function
app.post('/hello', async (req, res) => {
    const { privateKey } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::hello`,
                functionArguments: [],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mint NFT
app.post('/mint-nft', async (req, res) => {
    const { privateKey, uri } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::mint_nft`,
                functionArguments: [uri],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mint Token
app.post('/mint-token', async (req, res) => {
    const { privateKey, amount } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::mint_token`,
                functionArguments: [amount],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Transfer Token
app.post('/transfer-token', async (req, res) => {
    const { privateKey, recipientAddress, amount } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::transfer_token`,
                functionArguments: [recipientAddress, amount],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Transfer NFT
app.post('/transfer-nft', async (req, res) => {
    const { privateKey, recipientAddress, tokenId } = req.body;
    try {
        const account = Aptos.generateAccount({ privateKey });
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::main::transfer_nft`,
                functionArguments: [recipientAddress, tokenId],
            },
        });
        const senderAuthenticator = aptos.transaction.sign({
            signer: account,
            transaction,
        });
        const committedTransaction = await aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator,
        });
        res.json(committedTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});