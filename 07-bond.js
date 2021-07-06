const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.WESTEND_RPC_ACALA_UNO);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // Initialize account from the mnemonic
  const proxyAccount = keyring.addFromUri(process.env.EDUCATION_PROXY_B_MNEMONIC);

  // First we have to bond funds.
  // Here we use 'Stash' as reward destination
  // which means that received rewards will increase staked amount
  const amount = 1000000000000;
  const rewardDestination = 'Stash';
  let txHash = await api.tx.staking
    .bond(proxyAccount.address, amount, rewardDestination)
    .signAndSend(proxyAccount);

  console.log(`View .bond() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());