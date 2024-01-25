import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {
  ECDSAElastiVault,
  ECDSAElastiVault__factory,
} from "../typechain-types";
import {BigNumberish, Signer,} from "ethers";
import {getVMBytecodeSig} from "../src";

import {
  callTestInvalidShared,
  callTestShared, deployVaultFactoryFixture,
  execTestInvalidShared, execTestShared,
  extractDeploymentEvent
} from "./Helpers";
import {Artifact} from "hardhat/types";


describe("ECDSAElastiVault", function () {

  async function exec_ecdsa_bytecode (elastiVault: ECDSAElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean){
    const {bytecode, sig} = await getVMBytecodeSig(owners[0], artifact)

    if (other){
      return elastiVault.emulate(bytecode, sig)
    }

    return await elastiVault.emulate(bytecode, sig)
  }

  async function exec_call (vault:ECDSAElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean){
    const {bytecode, sig} = await getVMBytecodeSig(owners[0], artifact)

    if (other){
      return vault.emulate.staticCall(bytecode, sig)
    }

    return await vault.emulate.staticCall(bytecode, sig)
  }

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployECDSAVaultFixture() {
    const {vaultFactory, hyVM} = await loadFixture(deployVaultFactoryFixture);
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    // deploy an instance of the vault to be tested
    const {vaultAddr} = await extractDeploymentEvent(
        vaultFactory,
        await vaultFactory.deployECDSAVault(
            owner.address
        )
    )

    // get instance of deployed vault
    const elastiVault = ECDSAElastiVault__factory.connect(vaultAddr, owner)

    return { elastiVault, hyVM, vaultFactory, owner, otherAccount };
  }

  describe("Owner", function () {

    it("Expected default Owner", async function () {
      const { elastiVault, owner } = await loadFixture(deployECDSAVaultFixture);

      expect(await elastiVault.getSigner()).to.equal(owner.address)
    });

    it("Expected other Owner", async function () {
      const { otherAccount, hyVM} = await loadFixture(deployECDSAVaultFixture);

      const ownableVault_factory = await ethers.getContractFactory("ECDSAElastiVault");
      const elastiVault: ECDSAElastiVault = await ownableVault_factory.deploy(otherAccount.address, await hyVM.getAddress());

      expect(await elastiVault.getSigner()).to.equal(otherAccount.address)
    });
  });

  describe("Call", function () {

    it("CallTest", async function () {
      const { elastiVault, owner} = await loadFixture(deployECDSAVaultFixture);

      await callTestShared(exec_call, elastiVault, [owner], [], false)
    });

    it("CallTest incorrect owner", async function () {
      const { elastiVault, otherAccount} = await loadFixture(deployECDSAVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [otherAccount], [], "InvalidSigner", true)
    });
  });

  describe("Exec", function () {

    it("ExecTest", async function () {
      const { elastiVault, vaultFactory, owner} = await loadFixture(deployECDSAVaultFixture);

      await execTestShared(exec_ecdsa_bytecode, elastiVault, vaultFactory, [owner], [], false)
    });

    it("ExecTest incorrect owner", async function () {
      const { elastiVault, otherAccount} = await loadFixture(deployECDSAVaultFixture);

      await execTestInvalidShared(exec_ecdsa_bytecode, elastiVault, [otherAccount], [], "InvalidSigner", true)
    });
  });
});
