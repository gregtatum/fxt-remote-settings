import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  modelRegistryRootURL,
  modelRegistry,
  getRecordData
} from './utils.js'


downloadModels();

async function downloadModels() {
  for (const [languagePair, modelInfos] of Object.entries(modelRegistry)) {
    for (const [modelType, modelInfo] of Object.entries(modelInfos)) {
      const url = `${modelRegistryRootURL}/${languagePair}/${modelInfo.name}`;
      const dirname = fileURLToPath(new URL('.', import.meta.url));
      const localPath = path.join(dirname, "models", modelInfo.name);


      console.log();
      console.log(url);
      console.log(getRecordData(languagePair, modelType));

      if (fs.existsSync(localPath)) {
        console.log("Already downloaded", modelInfo.name);
        continue;
      }

      console.log("Downloading...", modelInfo.name);
      const response = await fetch(url);
      if (!response.ok) {
        console.log("Download failed.");
        continue;
      }

      console.log("Writing...", modelInfo.name);
      fs.writeFileSync(localPath, Buffer.from(await response.arrayBuffer()));
      console.log("Done writing...", modelInfo.name);
    }
  }
}
