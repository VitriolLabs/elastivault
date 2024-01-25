import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import 'hardhat-contract-sizer'
import '@vitriollabs/huff-deployer'
import './scripts/tasks/callElastiVault'
import './scripts/tasks/factoryDeployVault'

const config: HardhatUserConfig = {
  solidity: {
    // generally optimize the contracts for single use (for the dynamic scripts)
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1
          }
        }
      }
    ],
    overrides: {
      // override the optimizer for the vault for long-term gas optimization
      "Contracts/ElastiVaultFactory.sol": {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50000
          }
        }
      },
      "Contracts/OwnableElastiVault.sol": {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50000
          }
        }
      },
      "Contracts/ECDSAElastiVault.sol": {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50000
          }
        }
      },
      "Contracts/ECDSAMultiSigElastiVault.sol": {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50000
          }
        }
      },
    },
  },
  paths: {
    sources: "./Contracts",
    cache: "./.temp/cache",
    artifacts: "./.temp/artifacts"
  },
  contractSizer: {
    runOnCompile: true
  }
};

export default config;
