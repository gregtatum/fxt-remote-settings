import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import {
  modelRegistry,
  getRecordData
} from './utils.js'

dotenv.config();

const DIRNAME = fileURLToPath(new URL('.', import.meta.url));
const SERVER = "https://settings.dev.mozaws.net/v1";
// const SERVER = "http://localhost:8888/v1"
const BEARER_TOKEN = process.env.BEARER_TOKEN;
const CID = "translations-models";

if (!BEARER_TOKEN) {
  bearerTokenError("❌ No bearer token was provided for the Remote Settings API");
  process.exit(1);
}

/**
 * @param {string} message
 */
function bearerTokenError(message) {
  console.error([
    message,
    "",
    "  Log in via LDAP to: https://settings.dev.mozaws.net/v1/admin",
    "  In the header click the little clipboard icon to get the Bearer header.",
    "  Create a .env file in this directory",
    "  Put the bearer token in it like so:",
    "",
    `BEARER_TOKEN="Bearer uLdb-Yafefe....2Hyl5_w"`,
  ].join("\n"));
}

main();
async function main() {
  await verifyLogin();
  // await createCollection();
  for (const [languagePair, modelInfos] of Object.entries(modelRegistry)) {
    for (const [modelType] of Object.entries(modelInfos)) {
      try {
        await createRecord(languagePair, modelType);
      } catch (error) {

      }
    }
  }
}

async function verifyLogin() {
  const json = await getJSON("/", {
    headers: {
      // 'Authorization': BEARER_TOKEN
    },
  });

  if (!json.user) {
    bearerTokenError(
      "❌ Your bearer token has expired."
    );
    process.exit(1);
  }

  console.log("✅ Authorized to use the dev server as user", json.user.profile.email);
}

/**
 * The JSON to do this isn't documented anywhere that I've seen.
 * @deprecated
 */
async function createCollection() {
  const json = await getJSON(`/buckets/main-workspace/collections/${CID}`, {
    method: 'PUT',
    headers: {
      'Authorization': BEARER_TOKEN,
      'Content-Type': 'application/json',
    },
    body: fs.readFileSync(path.join(DIRNAME, "json-schema.json"))
  });

  console.log("Create collection:", json);
}

async function createRecord(languagePair, fileType) {
  console.log("Creating", languagePair, fileType);
  const { name, uuid } = modelRegistry[languagePair][fileType];
  const filePath = path.join(DIRNAME, "models", name);
  if (!name) {
    throw new Error("No name");
  }
  if (!uuid) {
    throw new Error("No uuid");
  }

  const body = new FormData();
  body.append('attachment', fs.createReadStream(filePath));
  body.append('data', JSON.stringify(getRecordData(languagePair, fileType)));

  const response = await getJSON(`/buckets/main-workspace/collections/${CID}/records/${uuid}/attachment`, {
    method: 'POST',
    headers: {
      ...body.getHeaders(),
      'Authorization': BEARER_TOKEN,
    },
    body
  });

  console.log("Create record:", response);
}

/**
 * @param {string} path
 * @param {RequestInit} settings
 */
async function getJSON(path, settings) {
  const url = SERVER + path;
  console.log(url, settings);
  const response = await fetch(url, settings);

  if (!response.ok) {
    console.error(`❌ Failed fetching ${url}`);
    console.error(`Status: ${response.status}`)
    try {
      console.error(await response.json());
    } catch (error) {
      console.error("Unable to read response");
    }
    // process.exit(1);
  }

  return JSON.parse(await response.text());
}
