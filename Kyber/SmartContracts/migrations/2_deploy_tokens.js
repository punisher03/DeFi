/* global artifacts */
// const KNC = artifacts.require('./mockTokens/KyberNetworkCrystal.sol');
// const KGT = artifacts.require('./mockTokens/KyberGenesisToken.sol');
// const OMG = artifacts.require('./mockTokens/OmiseGo.sol');
// const SALT = artifacts.require('./mockTokens/Salt.sol');
// const ZIL = artifacts.require('./mockTokens/Zilliqa.sol');
// const MANA = artifacts.require('./mockTokens/Mana.sol');
// const POLY = artifacts.require('./mockTokens/Polymath.sol');
// const SNT = artifacts.require('./mockTokens/Status.sol');
// const WETH = artifacts.require('./mockTokens/WrappedEther.sol');
const Wrapper = artifacts.require('./mockTokens/Wrapper.sol');
module.exports = async (deployer) => {
  // Deploy the tokens
  await deployer.deploy(Wrapper);
  // await deployer.deploy(DAI);
  // await deployer.deploy(OMG);
  // await deployer.deploy(SALT);
  // await deployer.deploy(ZIL);
  // await deployer.deploy(MANA);
  // await deployer.deploy(POLY);
  // await deployer.deploy(SNT);
};
