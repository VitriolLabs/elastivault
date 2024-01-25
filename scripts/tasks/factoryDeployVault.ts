// @ts-ignore
import {task} from "hardhat/config";
import {ContractTransactionResponse, EventLog} from "ethers";
import {ElastiVaultFactory, ElastiVaultFactory__factory} from "../../typechain-types";

task('factoryDeployVault', 'Deploy an instance of the ElastiVault')
    .addPositionalParam('factory', 'Address of the ElastiVault factory')
    .addPositionalParam('type', 'one of: [owned, ecdsa, multi]')
    .addPositionalParam('signers', 'comma separated list of signers. 1 for owned/ecdsa, & list for multi')
    .addOptionalParam('salt', 'salt for deployment, random if omitted')
    .addOptionalParam('quorum', 'min number of sigs used for multi type')
    .setAction(async ({factory, type, salt, quorum, signers}, hre) => {

        // @ts-ignore
        const [account] = await hre.ethers.getSigners()

        const factoryInstance: ElastiVaultFactory = ElastiVaultFactory__factory.connect(factory, account)

        let tx: ContractTransactionResponse;

        const signersList: string[] = signers.split(',');

        switch (type) {
            case "owned":
                tx = salt
                    ? await factoryInstance.deployOwnableVaultWithSalt(salt, signersList[0])
                    : await factoryInstance.deployOwnableVault(signersList[0]);
                break;
            case "ecdsa":
                tx = salt
                    ? await factoryInstance.deployECDSAVaultWithSalt(salt, signersList[0])
                    : await factoryInstance.deployECDSAVault(signersList[0]);
                break;
            case "multi":
                if (!quorum) {
                    throw new Error("Quorum is required for multi-signature vaults");
                }
                tx = salt
                    ? await factoryInstance.deployECDSAMultiSigVaultWithSalt(salt, quorum, signersList)
                    : await factoryInstance.deployECDSAMultiSigVault(quorum, signersList);
                break;
            default:
                console.error("Invalid Vault type Provided")
                return;
        }

        // get contract transaction receipt
        const tr = await tx.wait();

        // get the event we expect to be raised
        const event: EventLog = tr!.logs.find(e => 'fragment' in e && e.fragment.name === 'VaultDeployed') as EventLog;

        const [creatorAddr, vaultAddr, vaultType] = event.args;

        console.log(`${vaultType} Vault deployed at ${vaultAddr} by ${creatorAddr}`)
    })