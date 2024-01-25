// @ts-ignore
import {task} from "hardhat/config";
import {isAddress} from "ethers";
import {OwnableElastiVault, OwnableElastiVault__factory} from "../../typechain-types";
import {decodeFunctionResult, getVMBytecodeSig} from "../../src";

task('callOwnableElastiVault', 'Runs some code against a specified ElastiVault')
    .addPositionalParam('safe', 'safe address')
    .addPositionalParam('contract', 'contract containing script code')
    .addFlag("call", "Is this a contract call or exec")
    .setAction(async ({safe, contract, call}, hre) => {

        if (!isAddress(safe)) {
            throw Error("Safe address not valid")
        }

        // @ts-ignore
        const [account] = await hre.ethers.getSigners()

        const scriptArtifact = await hre.artifacts.readArtifact(contract)

        const {bytecode} = await getVMBytecodeSig(account, scriptArtifact)

        const sageInstance: OwnableElastiVault = OwnableElastiVault__factory.connect(safe, account)

        let responseData;

        if (call){
            responseData = await sageInstance.emulate.staticCall(bytecode)

            const scriptResult = decodeFunctionResult(scriptArtifact, responseData)

            console.log("scriptResult: ", scriptResult)

        } else {
            const txResp = await sageInstance.emulate(bytecode)

            const contReceipt = await txResp.wait()

            console.log("contract called called successfully", contReceipt)
        }
    })