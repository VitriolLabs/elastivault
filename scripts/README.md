
## Example Flow

> In the following snippets you will find some examples of how to interact with an ElastiVault.

***

Prepare local node and deploy ElastiVaultFactory & an instance of a OwnedElastiVault:
```shell
# start local node
hardhat node
# deploy an instance of the ElastiVaultFactory
hardhat run scripts/deployVaultFactory.ts --network goerli
# ElastiVaultFactory deployed to 0xd22a7F4672A38E2B955F914A5c62bE6f056FE731
# deploy an instance of an OwnedElastiVault
hardhat --network goerli factoryDeployVault 0xd22a7F4672A38E2B955F914A5c62bE6f056FE731 owned 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --salt 0x0000000000000000000000000000000000000000000018897b204de86ec7169b
# 0 Vault deployed at 0x2E7DE5bbe5044EEa7e5b2CE0D435bF8E10519003 by 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

<br/>

Perform a call from the perspective of the deployed OwnedElastiVault:  
```shell
hardhat --network goerli callOwnableElastiVault 0x2E7DE5bbe5044EEa7e5b2CE0D435bF8E10519003 CallTestGoerli --call
# Result(2) [ 'The balance is: ', 100000000000000000000000n ]
```

<br/>



(Preview) and Execute a script from the perspective of the deployed OwnedElastiVault
```shell
# preview the outcome of executing a script from the perspective of the deployed OwnedElastiVault (deploying another OwnedElastiVault)
hardhat --network goerli callOwnableElastiVault 0x2E7DE5bbe5044EEa7e5b2CE0D435bF8E10519003 ExecTestGoerli --call
# scriptResult:  Result(2) ['Vault Deployed at: ', '0xA9FCA1E3910B97EF9Fe706CFE1688c06a91ce8b7']
# actually execute the script from the perspective of the deployed OwnedElastiVault
hardhat --network goerli callOwnableElastiVault 0x2E7DE5bbe5044EEa7e5b2CE0D435bF8E10519003 ExecTestGoerli
# perform a call from the perspective of the (newly) deployed OwnedElastiVault
hardhat --network goerli callOwnableElastiVault 0xA9FCA1E3910B97EF9Fe706CFE1688c06a91ce8b7 CallTestGoerli --call
# Result(2) [ 'The balance is: ', 100000000000000000000000n ]
```
