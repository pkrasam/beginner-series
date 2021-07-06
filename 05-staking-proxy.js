const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.WESTEND_RPC_ACALA_UNO);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // Initialize accounts from the mnemonic
  const account = keyring.addFromUri(process.env.EDUCATION_STASH_MNEMONIC);
  const proxyAccount = keyring.addFromUri(process.env.EDUCATION_PROXY_B_MNEMONIC);

  // Get number of proxies for the given address
  const [proxies] = await api.query.proxy.proxies(account.address);
  console.log(`# of proxies for address ${account.address}`, proxies.length);
  console.log(`proxyDepositBase: ${api.consts.proxy.proxyDepositBase}`);
  console.log(`proxyDepositFactor: ${api.consts.proxy.proxyDepositFactor}`);

  // calculate the amount that needs to be deposited in each proxy
  const requiredDeposit = api.consts.proxy.proxyDepositBase + api.consts.proxy.proxyDepositFactor * proxies.length;
  console.log(`Required deposit for creating proxy: ${requiredDeposit}`);

  // Add a staking proxy
  const proxyType = 'Staking';
  const delay = 0;
  let txHash = await api.tx.proxy
    .addProxy(proxyAccount.address, proxyType, delay)
    .signAndSend(account);
  console.log(`.addProxy() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());