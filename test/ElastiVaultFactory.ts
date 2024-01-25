import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {setPrevRandao} from "@nomicfoundation/hardhat-network-helpers";
import {
  checkDeploymentEvent, deployVaultFactoryFixture,
  VaultType
} from "./Helpers";
import {AddressLike, BytesLike} from "ethers";


const SALT_OWNABLE: BytesLike = "0x0000000000000000000000000000000000000000000018897b204de86ec7169a";
const SALT_ECDSA: BytesLike = "0x0000000000000000000000000000000000000000000018897b204de86ec7169b";
const SALT_MULTI: BytesLike = "0x0000000000000000000000000000000000000000000018897b204de86ec7169c";

const SALT_OWNABLE_ADDR: AddressLike = "0x79d40BAd30babFF0f55889a54979B15944A8E1E6";
const SALT_ECDSA_ADDR: AddressLike = "0x00F904Aad376EE688E887A9c94ED8326054Ff995";
const SALT_MULTI_ADDR: AddressLike = "0x749184816374fa1B8823D0047EEcd28b94E5F67c";

const GEN_ADDR: AddressLike = "0xB2173137923B3AEfee4be8c0e8B3D8469BBBdef2";

describe("ElastiVaultFactory", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultFactoryFixtureLoc() {
    const {vaultFactory} = await loadFixture(deployVaultFactoryFixture);
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    // seed the pseudo-random generator
    await setPrevRandao(123);

    return { vaultFactory, owner, otherAccount };
  }

  describe("Find Deployment Address", function () {

    it("Should calculate expected deploy address for Ownable vault", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      expect(
          await vaultFactory.findOwnableVaultDeployAddress(
              SALT_OWNABLE,
              await owner.getAddress()
          )
      ).to.equal(SALT_OWNABLE_ADDR)
    });

    it("Should calculate expected deploy address for ECDSA vault", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      expect(
          await vaultFactory.findECDSAVaultDeployAddress(
              SALT_ECDSA,
              await owner.getAddress()
          )
      ).to.equal(SALT_ECDSA_ADDR)
    });

    it("Should calculate expected deploy address for  Ownable vault", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      expect(
          await vaultFactory.findECDSAMultiSigVaultDeployAddress(
              SALT_MULTI,
              1,
              [await owner.getAddress()]
          )
      ).to.equal(SALT_MULTI_ADDR)
    });
  });

  describe("Deployment", function () {

    it("Should deploy Ownable vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployOwnableVault(owner.address),
          GEN_ADDR,
          VaultType.Ownable
      )
    });

    it("Should deploy ECDSA vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployECDSAVault(await owner.getAddress()),
          GEN_ADDR,
          VaultType.ECDSA
      )
    });

    it("Should deploy ECDSA MultiSig vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployECDSAMultiSigVault(
              1,
              [await owner.getAddress()]
          ),
          GEN_ADDR,
          VaultType.ECDSAMulti
      )
    });

    describe("Other account", function () {

      it("Should deploy Ownable vault to expected address", async function () {
        const { vaultFactory, otherAccount } = await loadFixture(deployVaultFactoryFixtureLoc);

        await checkDeploymentEvent(
            vaultFactory,
            await vaultFactory.deployOwnableVault(
                otherAccount.address
            ),
            GEN_ADDR,
            VaultType.Ownable
        )
      });

      it("Should deploy ECDSA vault to expected address", async function () {
        const { vaultFactory, otherAccount } = await loadFixture(deployVaultFactoryFixtureLoc);

        await checkDeploymentEvent(
            vaultFactory,
            await vaultFactory.deployECDSAVault(
                otherAccount.address
            ),
            GEN_ADDR,
            VaultType.ECDSA
        )
      });

      it("Should deploy ECDSA MultiSig vault to expected address", async function () {
        const { vaultFactory, otherAccount } = await loadFixture(deployVaultFactoryFixtureLoc);

        await checkDeploymentEvent(
            vaultFactory,
            await vaultFactory.deployECDSAMultiSigVault(
                1,
                [otherAccount.address]
            ),
            GEN_ADDR,
            VaultType.ECDSAMulti
        )
      });
    });
  });

  describe("Salt Deployment", function () {

    it("Should deploy Ownable vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployOwnableVaultWithSalt(
              SALT_OWNABLE,
              await owner.getAddress()
          ),
          SALT_OWNABLE_ADDR,
          VaultType.Ownable
      )
    });

    it("Should deploy ECDSA vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployECDSAVaultWithSalt(
              SALT_ECDSA,
              await owner.getAddress()
          ),
          SALT_ECDSA_ADDR,
          VaultType.ECDSA
      )
    });

    it("Should deploy ECDSA MultiSig vault to expected address", async function () {
      const { vaultFactory, owner } = await loadFixture(deployVaultFactoryFixtureLoc);

      await checkDeploymentEvent(
          vaultFactory,
          await vaultFactory.deployECDSAMultiSigVaultWithSalt(
              SALT_MULTI,
              1,
              [await owner.getAddress()]
          ),
          SALT_MULTI_ADDR,
          VaultType.ECDSAMulti
      )
    });
  });
});
