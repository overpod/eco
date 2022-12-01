import { Client } from '@unique-nft/substrate-client';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import { SignatureType } from '@unique-nft/accounts';

const main = async () => {
  if (!process.env.CHAIN_WS_URL) {
    throw new Error('CHAIN_WS_URL is not set');
  }
  if (!process.env.OWNER_SEED) {
    throw new Error('OWNER_SEED is not set');
  }
  const keyringProvider = new KeyringProvider({
    type: SignatureType.Sr25519,
  });
  const signer = keyringProvider.addSeed(process.env.OWNER_SEED);
  const client = await Client.create({
    chainWsUrl: process.env.CHAIN_WS_URL,
    signer,
  });
  await client.connect();
  const chainProperties = client.chainProperties();
  console.log(chainProperties);


  await client.api.disconnect()
};

main();
