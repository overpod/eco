"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const substrate_client_1 = require("@unique-nft/substrate-client");
const keyring_1 = require("@unique-nft/accounts/keyring");
const accounts_1 = require("@unique-nft/accounts");
//import { createSigner } from '@unique-nft/substrate-client/sign';
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.CHAIN_WS_URL) {
        throw new Error('CHAIN_WS_URL is not set');
    }
    if (!process.env.OWNER_SEED) {
        throw new Error('OWNER_SEED is not set');
    }
    const keyringProvider = new keyring_1.KeyringProvider({
        type: accounts_1.SignatureType.Sr25519,
    });
    const signer = keyringProvider.addSeed(process.env.OWNER_SEED);
    const client = yield substrate_client_1.Client.create({
        chainWsUrl: process.env.CHAIN_WS_URL,
        signer,
    });
    yield client.connect();
    const chainProperties = client.chainProperties();
    console.log(chainProperties);
    yield client.api.disconnect();
});
main();
