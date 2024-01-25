import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {
  ECDSAMultiSigElastiVault,
  ECDSAMultiSigElastiVault__factory,
} from "../typechain-types";
import {AddressLike, type BigNumberish, Signer,} from "ethers";
import {getVMBytecode, getVMBytecodeSig} from "../src";
import {
  callTestInvalidShared,
  callTestShared,
  deployVaultFactoryFixture,
  execTestShared,
  extractDeploymentEvent
} from "./Helpers";
import {Artifact} from "hardhat/types";
import {IECDSAMultisigWalletInternal} from "../typechain-types/Contracts/ECDSAMultiSigElastiVault";

describe("ECDSAMultiSigElastiVault", function () {

  async function owners2signers(owners: Signer[], nonces: BigNumberish[], artifact: Artifact, contractAddress:AddressLike) {
    const sigs: IECDSAMultisigWalletInternal.SignatureStruct[] = []
    for (let i = 0; i < owners.length; i++) {
      const signer = owners[i]
      const nonce = nonces[i]
      const { sig} = await getVMBytecodeSig(signer, artifact, "c0406226", nonce, contractAddress)
      sigs.push({ data: sig, nonce: nonce })
    }
    return sigs
  }

  async function exec_ecdsa_bytecode (elastiVault: ECDSAMultiSigElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], _:boolean){

    const sigs: IECDSAMultisigWalletInternal.SignatureStruct[] = await owners2signers(owners, nonces, artifact, await elastiVault.getAddress())

    const bytecode = getVMBytecode(artifact)

    return elastiVault.emulate(bytecode, sigs)
  }

  async function exec_call (vault:ECDSAMultiSigElastiVault, artifact: Artifact, owners:Signer[], nonces:BigNumberish[], _:boolean){
    const sigs: IECDSAMultisigWalletInternal.SignatureStruct[] = await owners2signers(owners, nonces, artifact, await vault.getAddress())

    const bytecode = getVMBytecode(artifact)

    return vault.emulate.staticCall(bytecode, sigs)
  }

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployECDSAMultiSigVaultFixture() {
    const {vaultFactory, hyVM} = await loadFixture(deployVaultFactoryFixture);
    // Contracts are deployed using the first signer/account by default
    const [signer1, signer2, signer3, nonSigner1, nonSigner2, nonSigner3] = await ethers.getSigners();

    // deploy an instance of the vault to be tested
    const {vaultAddr} = await extractDeploymentEvent(
        vaultFactory,
        await vaultFactory.deployECDSAMultiSigVault(
            2,
            [signer1.address, signer2.address, signer3.address]
        )
    )

    // get instance of deployed vault
    const elastiVault = ECDSAMultiSigElastiVault__factory.connect(vaultAddr, signer1)

    return { elastiVault, hyVM, vaultFactory, signer1, signer2, signer3, nonSigner1, nonSigner2, nonSigner3 };
  }

  describe("Owner", function () {

    it("Expected default Owners", async function () {
      const { elastiVault, signer1, signer2, signer3, nonSigner1 } = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.getSigners()).to.deep.equal([signer1.address, signer2.address, signer3.address])
      expect(await elastiVault.isSigner(nonSigner1.address)).to.be.false
    });

    it("Expected other set of Owners", async function () {
      const { hyVM } = await loadFixture(deployECDSAMultiSigVaultFixture);
      const [signer1, signer2, signer3, nonSigner1] = await ethers.getSigners();

      const ownableVault_factory = await ethers.getContractFactory("ECDSAMultiSigElastiVault");
      const elastiVault: ECDSAMultiSigElastiVault = await ownableVault_factory.deploy([signer2.address, signer3.address, nonSigner1.address], 2, await hyVM.getAddress() );

      expect(await elastiVault.getSigners()).to.deep.equal([signer2.address, signer3.address, nonSigner1.address])
      expect(await elastiVault.isSigner(signer1.address)).to.be.false
    });
  });

  describe("Quorum", function () {

    it("Expected quorum", async function () {
      const { elastiVault} = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.getQuorum()).to.equal(2)
    });

    it("Expected other quorum", async function () {
      const { hyVM} = await loadFixture(deployECDSAMultiSigVaultFixture);
      const [signer2, signer3, nonSigner1] = await ethers.getSigners();

      const ownableVault_factory = await ethers.getContractFactory("ECDSAMultiSigElastiVault");
      const elastiVault: ECDSAMultiSigElastiVault = await ownableVault_factory.deploy([signer2.address, signer3.address, nonSigner1.address], 1, await hyVM.getAddress());

      expect(await elastiVault.getQuorum()).to.equal(1)
    });

    it("CallTest single owner", async function () {
      const { elastiVault, signer1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [signer1], [0], "ECDSAMultisigWallet__QuorumNotReached", true)
    });

    it("CallTest single non owner", async function () {
      const { elastiVault, nonSigner1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [nonSigner1], [0], "ECDSAMultisigWallet__QuorumNotReached", true)
    });
  });


  describe("Nonce", function () {

    it("Expected nonce", async function () {
      const { elastiVault, signer1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(false)
    });

    it("Consume nonce", async function () {
      const { elastiVault, vaultFactory, signer1, signer2, signer3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(false)
      await execTestShared(exec_ecdsa_bytecode, elastiVault, vaultFactory, [signer1, signer2, signer3], [0, 0, 0], false)
      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(true)
    });

    it("Call without consume", async function () {
      const { elastiVault, signer1, signer2, signer3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(false)
      await callTestShared(exec_call, elastiVault, [signer1, signer2, signer3], [0, 0, 0], false)
      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(false)
    });

    it("invalidate nonce", async function () {
      const { elastiVault, signer1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(false)
      expect(await elastiVault.invalidateNonce(signer1.address, 0)).to.not.be.reverted
      expect(await elastiVault.nonceInvalidated(signer1.address, 0)).to.equal(true)
    });

    // invalidate nonce
  });

  describe("Auth", function () {

    it("all owners", async function () {
      const { elastiVault, signer1, signer2, signer3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestShared(exec_call, elastiVault, [signer1, signer2, signer3], [0, 0, 0], false)
    });

    it("some owners", async function () {
      const { elastiVault, signer1, signer2} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestShared(exec_call, elastiVault, [signer1, signer2], [0, 0], false)
    });

    it("some owners 2", async function () {
      const { elastiVault, signer2, signer3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestShared(exec_call, elastiVault, [signer2, signer3], [0, 0], false)
    });

    it("same owner", async function () {
      const { elastiVault, signer1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [signer1, signer1], [0, 1], "ECDSAMultisigWallet__SignerAlreadySigned", true)
    });

    it("same owner mixed", async function () {
      const { elastiVault, signer1, signer2} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [signer1, signer1, signer2], [0, 1, 0], "ECDSAMultisigWallet__SignerAlreadySigned", true)
    });

    it("non owner included", async function () {
      const { elastiVault, signer1, nonSigner1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [signer1, nonSigner1], [0, 0], "ECDSAMultisigWallet__RecoveredSignerNotAuthorized", true)
    });

    it("non owner included 2", async function () {
      const { elastiVault, signer1, signer2, nonSigner1} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [signer1, signer2, nonSigner1], [0, 0, 0], "ECDSAMultisigWallet__RecoveredSignerNotAuthorized", true)
    });

    it("multiple non owner", async function () {
      const { elastiVault, nonSigner1, nonSigner2, nonSigner3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestInvalidShared(exec_call, elastiVault, [nonSigner1, nonSigner2, nonSigner3], [0, 0, 0], "ECDSAMultisigWallet__RecoveredSignerNotAuthorized", true)
    });
  });

  describe("Interact", function () {

    it("CallTest", async function () {
      const { elastiVault, signer1, signer2} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await callTestShared(exec_call, elastiVault, [signer1, signer2], [0, 0], false)
    });

    it("ExecTest", async function () {
      const { elastiVault, vaultFactory, signer1, signer2, signer3} = await loadFixture(deployECDSAMultiSigVaultFixture);

      await execTestShared(exec_ecdsa_bytecode, elastiVault, vaultFactory, [signer1, signer2, signer3], [0, 0, 0], false)
    });
  });
});
