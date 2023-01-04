import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const bearerToken = process.env.BEARER_TOKEN;

if (!bearerToken) {
  console.error([
    "No bearer token was provided for the Remote Settings API",
    "",
    "  Log in via LDAP to: https://settings.dev.mozaws.net/v1/admin",
    "  In the header click the little clipboard icon to get the Bearer header.",
    "  Create a .env file in this directory",
    "  Put the bearer token in it like so:",
    "",
    `BEARER_TOKEN="Bearer uLdb-Yafefe....2Hyl5_w"`,
  ].join("\n"));

  process.exit(1);
}
