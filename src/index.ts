import {Sdk} from "@unique-nft/sdk";
import {KeyringProvider} from "@unique-nft/accounts/keyring";

import { createCanvas, loadImage, registerFont } from 'canvas';
import axios from 'axios';
import { writeFileSync } from 'fs';
import { CronJob } from 'cron';

const main = async () => {
  ckeckEnv();

  const task = async () => {
    const data = await getData(process.env.API_COUNT_URL!!, process.env.API_WEIGHT_URL!!, process.env.API_KEY!!);
    if (!data) {
      return null;
    }

    await generateAndSaveResultImage({
      count: data.count,
      weight: data.weight,
      filesDirPath: `${__dirname}/${process.env.FILES_DIR!!}`,
    });

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
  const image = await loadImage(`${filesDirPath}/source.jpg`);

  registerFont(`${filesDirPath}/font.ttf`, { family: 'Font' });
  const canvas = createCanvas(image.width, image.height);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  ctx.font = '100px Font';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  ctx.fillText(count.toString(), 500, 1200);
  ctx.fillText(weight.toString(), 500, 1350);

  writeFileSync(`${filesDirPath}/result.jpeg`, canvas.toBuffer('image/jpeg'));
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
  // Тут непонятно что возвращать пластик или алюминий
  const count = dataCount?.totalPlasticCount as number;
  const weight = dataWeight?.totalPlasticWeight as number;
  return count && weight ? { count, weight } : null;
};

const envNames = ['CHAIN_WS_URL', 'OWNER_SEED', 'CRON_TIME', 'API_COUNT_URL', 'API_WEIGHT_URL', 'API_KEY', 'FILES_DIR'];

const ckeckEnv = () => {
  envNames.forEach((envName) => {
    if (!process.env[envName]) {
      throw new Error(`${envName} is not set`);
    }
  });
};

main();
