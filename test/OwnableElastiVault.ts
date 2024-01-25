import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {
  OwnableElastiVault,
  OwnableElastiVault__factory
} from "../typechain-types";
import {BigNumberish, Signer} from "ethers";

import {
  callTestInvalidShared,
  callTestShared, deployVaultFactoryFixture,
  execTestInvalidShared,
  execTestShared,
  extractDeploymentEvent
} from "./Helpers";
import {Artifact} from "hardhat/types";
import {getVMBytecodeSig} from "../src";

describe("OwnableElastiVault", function () {

  async function exec_ownable_bytecode (elastiVault: OwnableElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean){
    const {bytecode} = await getVMBytecodeSig(owners[0], artifact)

    if(other){
      return elastiVault.connect(owners[0]).emulate(bytecode)
    }

    return await elastiVault.emulate(bytecode)
  }

  async function exec_call (vault:OwnableElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], other:boolean){
    const {bytecode} = await getVMBytecodeSig(owners[0], artifact)

    if(other){
      return vault.connect(owners[0]).emulate.staticCall(bytecode)
    }

    return await vault.emulate.staticCall(bytecode)
  }

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOwnableVaultFixture() {
    const {vaultFactory, hyVM} = await loadFixture(deployVaultFactoryFixture);
    const [owner, otherAccount] = await ethers.getSigners();

    // deploy an instance of the vault to be tested
    const {vaultAddr} = await extractDeploymentEvent(
        vaultFactory,
        await vaultFactory.deployOwnableVault(
            owner.address
        )
    )
    // get instance of deployed vault
    const elastiVault = OwnableElastiVault__factory.connect(vaultAddr, owner)

    return { elastiVault, hyVM, vaultFactory, owner, otherAccount };
  }

  describe("Owner", function () {

    it("Expected default Owner", async function () {
      const { elastiVault, owner } = await loadFixture(deployOwnableVaultFixture);

      expect(await elastiVault.owner()).to.equal(owner.address)
    });

    it("Expected other Owner", async function () {
      const { hyVM, otherAccount} = await loadFixture(deployOwnableVaultFixture);

      const ownableVault_factory = await ethers.getContractFactory("OwnableElastiVault");
      const elastiVault: OwnableElastiVault = await ownableVault_factory.deploy(otherAccount.address, await hyVM.getAddress());

      expect(await elastiVault.owner()).to.equal(otherAccount.address)
    });
  });

  describe("Call", function () {

    it("CallTest", async function () {
      const { elastiVault, owner} = await loadFixture(deployOwnableVaultFixture);

      await callTestShared(exec_call, elastiVault, [owner], [], false)
    });

    it("CallTest incorrect owner", async function () {
      const { elastiVault, otherAccount} = await loadFixture(deployOwnableVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [otherAccount], [], "Ownable__NotOwner", true)
    });
  });

  describe("Exec", function () {

    it("ExecTest", async function () {
      const { elastiVault, vaultFactory, owner} = await loadFixture(deployOwnableVaultFixture);

      await execTestShared(exec_ownable_bytecode, elastiVault, vaultFactory, [owner], [], false)
    });

    it("ExecTest incorrect owner", async function () {
      const { elastiVault, otherAccount} = await loadFixture(deployOwnableVaultFixture);

      await execTestInvalidShared(exec_ownable_bytecode, elastiVault, [otherAccount], [], "Ownable__NotOwner", true)
    });
  });
});
