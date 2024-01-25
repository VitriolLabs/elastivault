<div align="center">
  <h1>ElastiVault</h1>
</div>

<div align="center">
  <h3><i>..an infinitely elastic smart contract wallet</i></h3>
  <br>
  An ElastiVault is a smart contract wallet&nbsp;/&nbsp;vault for advanced web3 use-cases.  
  <br>
  <br>
  ElastiVault(s) allow users to dynamically execute <b>any</b> on-chain action, without needing to rely on some pre-deployed logic smart contract(s).
  <br>
  <br>
  <a href="https://badge.fury.io/js/@vitriollabs%2Felastivault"><img src="https://badge.fury.io/js/@vitriollabs%2Felastivault.svg" alt="npm version" height="18"></a>
  <br>
</div>

***

The `ElastiVaultFactory` was created to deploy instances of the `OwnableElastiVault`, `ECDSAElastiVault`, and `ECDSAMultisigElastiVault`.

This repository includes contracts related to the `ElastiVault`, an infinitely elastic smart contract wallet. What this means, is that you can execute **any on-chain action** without needing to deploy predefined logic smart contracts.

Think of it this way; your current web3 UX can be quite cumbersome. Often many of your actions need to be executed in separate transactions, or if you want to perform some grouped-actions a smart contract would need to be deployed and then called. 

Each implementation of the `ElastiVault` offers a solution to this problem by allowing the user to execute arbitrary bytecode from the context of the wallet-vault. Basically, the vault allows users to specify "scripts" to run on-chain.

Consider this example: If you want to perform some complicated arbitrage of some erc20 from one dex to another:
- approve dex1 to swap your token
- call dex1 to perform a token swap
- transfer the tokens
- approve dex2 to swap your token
- call dex2 to perform a token swap

> This can be accomplished in **1 call** to an `ElastiVault`, as the user can define a single script that performs ALL of these actions, executing it from their wallet-vault.

The `ElastiVault` allows for some pretty complicated use-cases, each in **1 transaction**:
- execute multiple swaps
- interact with several protocols 
- read complicated state from several on-chain sources, and use that state to conditionally perform an action (require statements etc. are fully supported)

These on-chain scripts written/used here are all written in `Solidity`, but any language that complies to EVM-bytecode should be possible here.

## Example Usage

### HardHat Scripts

```shell
# start hardhat node
hardhat node
# deploy the ElastiVault factory contract
hardhat run scripts/deployVaultFactory.ts # returns <VAULT_ADDR> ex: 0x106297B870019eBbcC51E84E350899da495cE803
# deploy an "owned" vault using a chosen ElastiVault factory
hardhat --network localhost factoryDeployVault <VAULT_ADDR> owned <CHOSEN_SIGNER(S)> # returns <VAULT_ADDR>
# call a basic script from the context of a chosen ElastiVault (that the caller owns)
hardhat --network localhost callOwnableElastiVault <VAULT_ADDR> CallTest --call
```

### HardHat Tests

```shell
# start hardhat node
hardhat node
# run the tests against the local node
hardhat test --network localhost
```

## Factory Contract Deployments:

The `ElastiVaultFactory` has been deployed to `0x00000000131889aD41211C79fc63860c9720D4de` on the following networks:
- Ethereum
  - [Mainnet](https://etherscan.io/address/0x00000000131889aD41211C79fc63860c9720D4de)
  - [Goerli Testnet](https://goerli.etherscan.io/address/0x00000000131889aD41211C79fc63860c9720D4de)
  - [Sepolia Testnet](https://sepolia.etherscan.io/address/0x00000000131889aD41211C79fc63860c9720D4de)

## Future Plans

- ZK ownership - Allow the use of Zero Knowledge proofs to verify ownership of a vault
- Support ERC-4337 Account Abstraction

## Notes

- For maximum compatibility, if storing state (`storage`) in an ElastiVault we highly recommended using the [Diamond storage pattern](https://medium.com/1milliondevs/new-storage-layout-for-proxy-contracts-and-diamonds-98d01d0eadb.). This is not required, but helps to avoid storage collisions.
- The tests included here are intended to be run against a mainnet/testnet fork due to availability of external dependencies. Currently the tests are set to run against the Goerli Testnet.
- Also consult the [HyVM repo](https://github.com/oguimbal/HyVM) in regards to memory layout, divergence, & EVM `opcode` compatibility.
- Each `ElastiVault` implementation is by-design able to execute arbitrary bytecode (scripts) on-chain, and this comes with its associated dangers. Users of these vaults should be careful to sign transactions/bytecode, just as with any web3 interaction. Special steps should be taken by the user to ensure they are only executing bytecode they are familiar with. We invite external parties to help build out tooling that will make this safer for users.

### Repo Layout:

```shell
Contracts/    
  # dynamic scripts to be executed on-chain
  sol_scripts/
  # ElastiVault owned by an arbitrary Signer
  ECDSAElastiVault.sol
  # ElastiVault owned by an arbitrary number of Signer(s), requiring some quorum
  ECDSAMultiSigElastiVault.sol
  # Factory contract used to deploy the other vaults
  ElastiVaultFactory.sol
  # ElastiVault using SafeOwnable ownership
  OwnableElastiVault.sol
deployment/
  # metadata related to the ElastiVaultFactory's deployment
  deployTx.json
scripts/
  # Hardhat tasks to interact with an ElastiVault Factory or to call/exec scripts in the context of an ElastiVault
  tasks/
  # deploy the ElastiVault Factory
  deployVaultFactory.ts
# code to enable arbitrary contract bytecode to be executable in the context of an ElastiVault
src/
# Basic tests also demonstrating how to interact with the ElastiVault implementations
test/
```

## Authors / Mentions

This repo was created by [Cameron White (Slvrfn)](https://ca.meron.dev) of [Vitriol Labs](https://vitriol.sh), but would not have been possible without the contributions of:
- [oguimbal (HyVM)](https://github.com/oguimbal/HyVM)

## Contributing

Contributions are welcome, please review [CONTRIBUTIONS](https://github.com/VitriolLabs/elastivault/blob/main/CONTRIBUTING.md) for more details.

## License

The files contained therein are licensed under The MIT License (MIT). See the [LICENSE](https://github.com/VitriolLabs/elastivault/blob/main/LICENSE.md) file for more details.

## Disclaimer

Please review the [DISCLAIMER](https://github.com/VitriolLabs/elastivault/blob/main/DISCLAIMER.md) for more details.

## External Dependencies

- `ElastiVaultFactory`
  - [ImmutableDeploymentFactory](https://github.com/VitriolLabs/immutable-deployment-factory): Smart Contract used to facilitate "immutable" create2/3 contract deployments (which prevents deploying code to a preexisting contract address).
- `ElastiVault`
  - [The HyVM](https://github.com/oguimbal/HyVM): Smart Contract that acts as an EVM, to allow for arbitrary bytecode to be executed on-chain.

***

## Donations (beermoney):

- Eth: [vitriollabs.eth (0xFe9fe85c7E894917B5a42656548a9D143f96f12E)](https://etherscan.io/address/0xFe9fe85c7E894917B5a42656548a9D143f96f12E)
- Btc: bc1qwf9xndxfwhfuul93seaq603xkgr64cwkc4d4dd
