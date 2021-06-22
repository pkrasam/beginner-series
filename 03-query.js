const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.WESTEND_RPC_ACALA_UNO);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // 1. Query blockchain details
  console.log("*****************************");
  console.log(" 1. Query blockchain details ")
  console.log("*****************************");
  console.log(`Genesis hash: ${api.genesisHash}`);
  console.log(`Runtime version: ${api.runtimeVersion}`);
  console.log(`Library info: ${api.libraryInfo}`);

  const chain = await api.rpc.system.chain();
  const lastHeader = await api.rpc.chain.getHeader();

  console.log(`Chain name: ${chain}`);
  console.log(`Last block number: ${lastHeader.number}`);
  console.log(`Last block hash: ${lastHeader.hash}`);

  // 2. Query account details
  const { nonce, refcount, data: balance } = await api.query.system.account(process.env.ADDRESS);
  console.log(`Nonce: ${nonce}`);
  console.log(`Referendum count: ${refcount}`);
  console.log(`Free balance: ${balance.free}`);
  console.log(`Reserved balance: ${balance.reserved}`);

  // 3. Query validator set
  const eraAtRaw = await api.query.staking.activeEra();
  const eraAt = eraAtRaw.unwrap().index.toNumber();
  const eraStakers = await api.query.staking.erasStakers.entries(eraAt)

  eraStakers.map(async ([key, data]) => {
    console.log(`Validator stash account: ${key.args[1]}`);
    console.log(`Total: ${data.total}`);
    console.log(`Own: ${data.own}`);
    console.log('-----------------');
  });


  // 4. Query list of transactions
  // TODO: Replace height and validatorAddr for Westend
  const height = 4626906;
  const validatorAddr = '16a4Q1iudXznPBx3CzJRaxXtYNenzGAZXdBZZkc5KrNxLXFP';
  const blockHash = await api.rpc.chain.getBlockHash(height);

  const block = await api.rpc.chain.getBlock(blockHash);
  console.log('Block details: ', block.toHuman());

  block.block.extrinsics.forEach((extrinsic, index) => {
    if (extrinsic.toHuman().isSigned) {
      console.log(`Signed transaction ${index}: `, extrinsic.toHuman());
    }
  });


  // 5. Query blockchain information at given height
  const [timestamp, era, session] = await Promise.all([
    api.query.timestamp.now.at(blockHash),
    api.query.staking.currentEra.at(blockHash),
    api.query.session.currentIndex.at(blockHash),
  ]);
  console.log(`Block timestamp: ${timestamp}`);
  console.log(`Block era: ${era}`);
  console.log(`Block session: ${session}`);


  // 6. Query events
  // Get events at given height
  const events = await api.query.system.events.at(blockHash);
  events.forEach((event, index) => {
    console.log(`Event ${index}: `, event.event.toHuman());
  });

}

main().catch((err) => { console.error(err) }).finally(() => process.exit())
