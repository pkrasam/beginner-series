const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.WESTEND_RPC_ACALA_UNO);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // Initialize account from the mnemonic
  const proxyAccount = keyring.addFromUri(process.env.EDUCATION_PROXY_B_MNEMONIC);

  // Nominate validators
  // The list of validators can be found here
  // https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/staking
  // We picked one but feel free to pick different ones
  const validator1 = '5CFPcUJgYgWryPaV1aYjSbTpbTLu42V32Ytw1L9rfoMAsfGh';
  const validator2 = '5CPDNHdbZMNNeHLq7t9Cc434CM1fBL6tkaifiCG3kaQ8KHv8';

  txHash = await api.tx.staking
    .nominate([validator1, validator2])
    .signAndSend(proxyAccount);

console.log(`View .nominate() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());