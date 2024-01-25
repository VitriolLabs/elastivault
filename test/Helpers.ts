import {AddressLike, BigNumberish, ContractTransactionReceipt, ContractTransactionResponse, Signer} from "ethers";
import {assert, expect} from "chai";
import {
    ImmutableDeploymentFactory,
    ElastiVaultFactory,
    OwnableElastiVault,
    OwnableElastiVault__factory
} from "../typechain-types";
import {artifacts, ethers, huffDeployer} from "hardhat";
import {decodeFunctionResult, getVMBytecodeSig} from "../src";
import {Artifact} from "hardhat/types";
import {CompilerArg} from "@vitriollabs/huff-deployer/dist/src/helpers";

export enum VaultType { Ownable, ECDSA, ECDSAMulti }

// We define a fixture to reuse the same setup in every test.
// We use loadFixture to run this setup once, snapshot that state,
// and reset Hardhat Network to that snapshot in every test.
export async function deployVaultFactoryFixture() {
    const [_, otherAccount] = await ethers.getSigners();
    const c2fFactory = await ethers.getContractFactory("ImmutableDeploymentFactory");
    const c2f: ImmutableDeploymentFactory = await c2fFactory.deploy();
    console.log("c2f deployed at: ", await c2f.getAddress())

    const hyVM = await huffDeployer.deploy("HyVm", false, undefined, [
        {
            key: "e",
            value: "paris",
            full: false
        } as CompilerArg
    ]);
    console.log("hyVM deployed at: ", await hyVM.getAddress())

    const oFactory = await ethers.getContractFactory("OwnableElastiVault");
    const o: OwnableElastiVault = await oFactory.deploy(otherAccount.address, await hyVM.getAddress());
    console.log("oVault deployed at: ", await o.getAddress())

    // use shared vault factory across tests for consistency
    const vaultFactory_factory = await ethers.getContractFactory("ElastiVaultFactory");
    const vaultFactory: ElastiVaultFactory = await vaultFactory_factory.deploy(await c2f.getAddress(), await hyVM.getAddress());
    console.log("vault factory deployed at: ", await vaultFactory.getAddress())

    return {vaultFactory, hyVM, c2f}
}

export async function extractDeploymentEvent(vaultFactory: ElastiVaultFactory, transactionResp: ContractTransactionResponse) {
    const transactionReceipt: ContractTransactionReceipt = (await transactionResp.wait(1))!

    const filter = vaultFactory.filters.VaultDeployed
    const events = await vaultFactory.queryFilter(filter, transactionReceipt.blockHash)
    const event = events[0]

    if (!event) {
        assert(false, "Event not found")
    }
    const [creatorAddr, vaultAddr, vaultType] = event.args;

    return {creatorAddr, vaultAddr, vaultType}
}

export async function checkDeploymentEvent(vaultFactory: ElastiVaultFactory, transactionResp: ContractTransactionResponse, deployedAddr: AddressLike, deployedVaultType: VaultType) {
    const {creatorAddr, vaultAddr, vaultType} = await extractDeploymentEvent(vaultFactory, transactionResp)

    expect(vaultAddr).to.equal(deployedAddr)
    expect(vaultType).to.equal(deployedVaultType)

    return {creatorAddr, vaultAddr, vaultType}
}

async function callTestOwnable(vault: OwnableElastiVault, signer: Signer) {
    const [_owner, otherAccount] = await ethers.getSigners();
    const scriptArtifact = await artifacts.readArtifact("CallTest")

    const { bytecode} = await getVMBytecodeSig(signer, scriptArtifact)

    const responseData = await vault.emulate.staticCall(bytecode)

    const [_, val] = decodeFunctionResult(scriptArtifact, responseData)

    expect(val).to.equal(otherAccount.address)
}

export async function execTestShared(execBytecode: (vault:any, art:Artifact, owns:Signer[], nonces: BigNumberish[], other:boolean)=>Promise<ContractTransactionResponse>, vault:any, vaultFactory:ElastiVaultFactory, owners:Signer[], nonces:BigNumberish[], other:boolean) {

    const scriptArtifact = await artifacts.readArtifact("ExecTest")

    const {vaultAddr: deployedVaultAddress} = await checkDeploymentEvent(
        vaultFactory,
        await execBytecode(vault, scriptArtifact, owners, nonces, other),
        "0x8658c0F258206B62A5A3A716EdC39d9888B057D6",
        VaultType.Ownable
    )

    const newVault = OwnableElastiVault__factory.connect(deployedVaultAddress, owners[0])

    await callTestOwnable(newVault, owners[0])
}

export async function execTestInvalidShared(execBytecode: (vault:any, artifact: Artifact, owners:Signer[], nonces: BigNumberish[], other:boolean)=>Promise<ContractTransactionResponse>, vault:any, owners:Signer[], nonces:BigNumberish[], eventName:string, other:boolean) {

    const scriptArtifact = await artifacts.readArtifact("ExecTest")

    await expect(
        execBytecode(vault, scriptArtifact, owners, nonces, other)
    ).to.be.revertedWithCustomError(vault, eventName)
}

export async function callTestShared(callBytecode: (vault:any, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean)=>Promise<string>, vault: any, owners:Signer[], nonces:BigNumberish[], other:boolean, contractName="CallTest") {
    const [_owner, otherAccount] = await ethers.getSigners();
    const scriptArtifact = await artifacts.readArtifact(contractName)

    const responseData = await callBytecode(vault, scriptArtifact, owners, nonces, other)

    const [_, val] = decodeFunctionResult(scriptArtifact, responseData)

    expect(val).to.equal(otherAccount.address)
}

export async function callTestInvalidShared(callBytecode: (vault:any, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean)=>Promise<string>, vault: any, owners:Signer[], nonces:BigNumberish[], eventName:string, other:boolean) {
    const scriptArtifact = await artifacts.readArtifact("CallTest")

    await expect(
        callBytecode(vault, scriptArtifact, owners, nonces, other)
    ).to.be.revertedWithCustomError(vault, eventName)
}
