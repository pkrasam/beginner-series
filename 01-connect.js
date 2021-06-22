const { ApiPromise, WsProvider } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.WESTEND_RPC_ACALA_UNO);
  const api = await ApiPromise.create({ provider: httpProvider });

  // Query the Polkadot API for a timestamp
  const now = await api.query.timestamp.now();

  console.log(`Last timestamp: ${now}`);
}

main().catch((err) => { console.error(err) }).finally(() => process.exit());
