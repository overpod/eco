import { Client, Sdk } from '@unique-nft/sdk';
import { KeyringAccount, KeyringProvider } from '@unique-nft/accounts/keyring';

import { createCanvas, loadImage, registerFont } from 'canvas';
import axios from 'axios';
import { promises as fs } from 'fs';
import { CronJob } from 'cron';

const main = async () => {
  ckeckEnv([
    'CHAIN_WS_URL',
    'OWNER_ADDRESS',
    'ADMIN_MNEMONIC',
    'COLLECTION_ID',
    'IPFS_URL',
    'CRON_TIME',
    'API_COUNT_URL',
    'API_WEIGHT_URL',
    'API_KEY',
    'FILES_DIR',
  ]);

  const adminAccount = await KeyringProvider.fromMnemonic(process.env.ADMIN_MNEMONIC!!);
  const sdk = new Sdk({
    baseUrl: 'https://rest.dev.uniquenetwork.dev/v1',
    signer: adminAccount,
  });

  const image = {
    cid: 'QmdsyUhy3dJYVAhMGofsEKH6kEkinciXpMJcmhZ1XJiSW1',
    fullUrl: 'https://ipfs.uniquenetwork.dev/ipfs/QmdsyUhy3dJYVAhMGofsEKH6kEkinciXpMJcmhZ1XJiSW1',
    fileUrl: 'https://ipfs.uniquenetwork.dev/ipfs/QmdsyUhy3dJYVAhMGofsEKH6kEkinciXpMJcmhZ1XJiSW1',
  };

  //const collection = await createEcoCollection(sdk, adminAccount);
  //console.log('Collection created', collection);

  const collection = await sdk.collections.get({ collectionId: parseInt(process.env.COLLECTION_ID!!) });

  
  const createResult = await sdk.tokens.create.submitWaitResult({
    owner: adminAccount.getAddress(),
    data: {
      image: {
        ipfsCid: 'QmQbVM8zTcD6LS4vJ6eiygvQeSBaSvaf2pFTm6VpFGxx52',
      },
    },
    collectionId: collection.id,
    address: adminAccount.getAddress(),
    properties: [
      {
        key: 'totalPlasticCount',
        value: '0',
      },
      {
        key: 'totalPlasticWeight',
        value: '0',
      },
      {
        key: 'totalAluminumCount',
        value: '0',
      },
      {
        key: 'totalAluminumWeight',
        value: '0',
      },
    ],
  });

  console.log(createResult, '----');

  if (createResult.isCompleted && createResult.parsed) {
    const token = await sdk.tokens.get({
      collectionId: parseInt(process.env.COLLECTION_ID!!),
      tokenId: createResult.parsed.tokenId,
    });
    console.log(token, '----');
  }


  /*
    const token = await sdk.tokens.create.submitWaitResult({
      owner: process.env.OWNER_ADDRESS!!,
      data: {
        image: {
          urlInfix: 'string',
          hash: 'string',
        },
      },
      collectionId: parseInt(process.env.COLLECTION_ID!!),
      address: process.env.OWNER_ADDRESS!!,
    });
    */

  // ---------------------------
  /*
  const task = async () => {
    const data = await getData(process.env.API_COUNT_URL!!, process.env.API_WEIGHT_URL!!, process.env.API_KEY!!);
    if (!data) {
      return null;
    }

    const file = await generateAndSaveResultImage({
      count: data.count,
      weight: data.weight,
      filesDirPath: `${__dirname}/${process.env.FILES_DIR!!}`,
    });

    const response = await sdk.ipfs.uploadFile({ file });

    console.log(response, '--------');

    return data;
  };

  const job = new CronJob(
    process.env.CRON_TIME!!,
    async function () {
      const data = await task();
      if (!data) {
        return;
      }

      console.log(data);
    },
    null,
    true
  );

  job.start();
  */
};

const generateAndSaveResultImage = async ({
  count,
  weight,
  filesDirPath,
}: {
  count: number;
  weight: number;
  filesDirPath: string;
}) => {
  const image = await loadImage(`${filesDirPath}/source.png`);

  registerFont(`${filesDirPath}/font.ttf`, { family: 'Font' });
  const canvas = createCanvas(image.width, image.height);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  ctx.font = '100px Font';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  ctx.fillText(count.toString(), 500, 1200);
  ctx.fillText(weight.toString(), 500, 1350);

  const buffer = canvas.toBuffer('image/png');

  //await fs.writeFile(`${filesDirPath}/result.png`, buffer);

  return buffer;
};

const getData = async (apiCountUrl: string, apiWeightUrl: string, apiKey: string) => {
  const [{ data: dataCount }, { data: dataWeight }] = await Promise.all([
    axios.get(apiCountUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }),
    axios.get(apiWeightUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }),
  ]);
  if (!dataCount && !dataWeight) {
    return null;
  }
  console.log(dataCount, dataWeight);
  // Тут непонятно что возвращать пластик или алюминий
  const count = dataCount?.totalPlasticCount as number;
  const weight = dataWeight?.totalPlasticWeight as number;
  return count && weight ? { count, weight } : null;
};

const ckeckEnv = (envNames: string[]) => {
  envNames.forEach((envName) => {
    if (!process.env[envName]) {
      throw new Error(`${envName} is not set`);
    }
  });
};

const createEcoCollection = async (sdk: Client, adminAccount: KeyringAccount) =>
  sdk.collections.creation.submitWaitResult({
    mode: 'NFT',
    name: 'Eco',
    description: 'Eco',
    tokenPrefix: 'ECO',
    metaUpdatePermission: 'ItemOwner',
    permissions: {
      access: 'Normal',
      mintMode: true,
      nesting: {
        tokenOwner: true,
        collectionAdmin: true,
      },
    },
    readOnly: true,
    address: adminAccount.getAddress(),
    tokenPropertyPermissions: [
      {
        key: 'totalPlasticCount',
        permission: {
          mutable: true,
          collectionAdmin: true,
          tokenOwner: true,
        },
      },
      {
        key: 'totalPlasticWeight',
        permission: {
          mutable: true,
          collectionAdmin: true,
          tokenOwner: true,
        },
      },
      {
        key: 'totalAluminumCount',
        permission: {
          mutable: true,
          collectionAdmin: true,
          tokenOwner: true,
        },
      },
      {
        key: 'totalAluminumWeight',
        permission: {
          mutable: true,
          collectionAdmin: true,
          tokenOwner: true,
        },
      },
    ],
    schema: {
      coverPicture: {
        ipfsCid: '',
      },
      image: {
        urlTemplate: `${process.env.IPFS_URL}/ipfs/{infix}`,
      },
      schemaName: 'unique',
      schemaVersion: '1.0.0',
    },
  });

main();
