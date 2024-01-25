// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IImmutableDeploymentFactory} from "./interfaces/IImmutableDeploymentFactory.sol";
import {OwnableElastiVault} from "./OwnableElastiVault.sol";
import {ECDSAElastiVault} from "./ECDSAElastiVault.sol";
import {ECDSAMultiSigElastiVault} from "./ECDSAMultiSigElastiVault.sol";


/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title ElastiVault Factory.
 * @author slvrfn
 * @notice A factory to generate "elastic" smart contract wallet-vault(s). This contract can generate each of:
 *         OwnableElastiVault, ECDSAElastiVault, & ECDSAMultiSigElastiVault w/wo a provided salt.
 */
contract ElastiVaultFactory {
    // The address of the contract used to deploy the token Diamond contracts
    IImmutableDeploymentFactory public immutable deploymentFactory;

    // Address of the HyVm, credit @oguimbal - https://github.com/oguimbal/HyVM
    address public immutable hyVM;

    constructor(address _deploymentFactory, address _vm) {
        deploymentFactory = IImmutableDeploymentFactory(_deploymentFactory);
        hyVM = _vm;
    }

    enum VaultType {
        OWNABLE,
        ECDSA,
        ECDSA_MULTISIG
    }

    /**
     * @dev Raised when an invalid salt is provided.
     */
    error InvalidSalt();

    /**
     * @dev Raised when a contract is deployed.
     */
    event VaultDeployed(address creator, address vault, VaultType vaultType);

    // region Find deployment address

    /**
     * @notice Find the deployment address of an OwnableElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  owner - owner of the deployed vault
     * @return calculated address of the OwnableElastiVault
     */
    function findOwnableVaultDeployAddress(bytes32 salt, address owner) external view returns (address) {
        return _getDeployAddress(salt);
    }

    /**
     * @notice Find the deployment address of an ECDSAElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  signer - signer (owner) of the deployed vault
     * @return calculated address of the ECDSAElastiVault
     */
    function findECDSAVaultDeployAddress(bytes32 salt, address signer) external view returns (address) {
        return _getDeployAddress(salt);
    }

    /**
     * @notice Find the deployment address of an ECDSAMultiSigElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  quorum - quorum of signers needed for multisig
     * @param  signers - signers that should be added to the multisig vault
     * @return calculated address of the ECDSAMultiSigElastiVault
     */
    function findECDSAMultiSigVaultDeployAddress(bytes32 salt, uint256 quorum, address[] calldata signers) external view returns (address) {
        return _getDeployAddress(salt);
    }

    // endregion Find deployment address

    // region Deploy Vault

    /**
     * @notice Deploys an instance of the OwnableElastiVault
     * @param  owner - owner of the deployed vault
     * @return deployed address of the OwnableElastiVault
     */
    function deployOwnableVault(address owner) external returns (address) {
        return _deployVaultWithSalt(_pseudoRandomValue(), _getOwnableInitCode(owner), VaultType.OWNABLE);
    }

    /**
     * @notice Deploys an instance of the ECDSAElastiVault
     * @param  signer - signer (owner) of the deployed vault
     * @return deployed address of the ECDSAElastiVault
     */
    function deployECDSAVault(address signer) external returns (address) {
        return _deployVaultWithSalt(_pseudoRandomValue(), _getECDSAInitCode(signer), VaultType.ECDSA);
    }

    /**
     * @notice Deploys an instance of the ECDSAMultiSigElastiVault
     * @param  quorum - quorum of signers needed for multisig
     * @param  signers - signers that should be added to the multisig vault
     * @return deployed address of the ECDSAMultiSigElastiVault
     */
    function deployECDSAMultiSigVault(uint256 quorum, address[] calldata signers) external returns (address) {
        return _deployVaultWithSalt(_pseudoRandomValue(), _getECDSAMultiSigInitCode(signers, quorum), VaultType.ECDSA_MULTISIG);
    }

    // endregion Deploy Vault

    // region Salt-Deploy Vault

    /**
     * @notice Deploys an instance of the OwnableElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  owner - owner of the deployed vault
     * @return deployed address of the OwnableElastiVault
     */
    function deployOwnableVaultWithSalt(bytes32 salt, address owner) external returns (address) {
        return _deployVaultWithSalt(salt, _getOwnableInitCode(owner), VaultType.OWNABLE);
    }

    /**
     * @notice Deploys an instance of the ECDSAElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  signer - signer (owner) of the deployed vault
     * @return deployed address of the ECDSAElastiVault
     */
    function deployECDSAVaultWithSalt(bytes32 salt, address signer) external returns (address) {
        return _deployVaultWithSalt(salt, _getECDSAInitCode(signer), VaultType.ECDSA);
    }

    /**
     * @notice Deploys an instance of the ECDSAMultiSigElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  quorum - quorum of signers needed for multisig
     * @param  signers - signers that should be added to the multisig vault
     * @return deployed address of the ECDSAMultiSigElastiVault
     */
    function deployECDSAMultiSigVaultWithSalt(bytes32 salt, uint256 quorum, address[] calldata signers) external returns (address) {
        return _deployVaultWithSalt(salt, _getECDSAMultiSigInitCode(signers, quorum), VaultType.ECDSA_MULTISIG);
    }

    // endregion Salt-Deploy Vault

    // region Internal

    /**
     * @dev Returns a pseudo-random value
     */
    function _pseudoRandomValue() internal view returns (bytes32) {
        // first 20 bytes are expected to be caller or empty if random
        uint256 mask = 0x000000000000000000000000000000000000000000000000ffffffffffffffff;
        uint256 rand = uint256(keccak256(abi.encodePacked(msg.sender, block.prevrandao)));
        return bytes32(mask & rand);
    }

    /**
     * @notice Deploys an instance of the ElastiVault
     * @param  salt - salt used to determine deployment address
     * @param  initcode - contract initcode for an ElastiVault
     * @param  vaultType - type of vault being deployed
     * @return deploymentAddress - deployed address of the ElastiVault
     */
    function _deployVaultWithSalt(bytes32 salt, bytes memory initcode, VaultType vaultType) internal returns (address deploymentAddress) {
        // if salt is missing raise error
        if (salt == bytes32(0)) {
            revert InvalidSalt();
        }
        // deploying contract with constructor args, they must be appended to end of bytecode
        deploymentAddress = deploymentFactory.safeCreate3(salt, initcode);
        // raise deployment event
        emit VaultDeployed(msg.sender, deploymentAddress, vaultType);
    }

    /**
     * @notice Gets the expected deployment address for a particular salt/bytecode combination
     * @param  salt - salt used to determine deployment address
     * @return calculated address of the ElastiVault
     */
    function _getDeployAddress(bytes32 salt) internal view returns (address) {
        // if salt is missing raise error
        if (salt == bytes32(0)) {
            revert InvalidSalt();
        }

        return deploymentFactory.findCreate3Address(salt);
    }

    /**
     * @notice Gets the deployment bytecode for an OwnableElastiVault
     * @param  owner - owner of the vault
     * @return OwnableElastiVault deployment bytecode
     */
    function _getOwnableInitCode(address owner) internal view returns (bytes memory) {
        // determine the target address for contract deployment.
        return abi.encodePacked(type(OwnableElastiVault).creationCode, abi.encode(owner, hyVM));
    }

    /**
     * @notice Gets the deployment bytecode for an ECDSAElastiVault
     * @param  signer - signer of the vault
     * @return ECDSAElastiVault deployment bytecode
     */
    function _getECDSAInitCode(address signer) internal view returns (bytes memory) {
        // determine the target address for contract deployment.
        return abi.encodePacked(type(ECDSAElastiVault).creationCode, abi.encode(signer, hyVM));
    }

    /**
     * @notice Gets the deployment bytecode for an ECDSAMultiSigElastiVault
     * @param  signers - owner(s) of the vault
     * @param  quorum - how many signers are required to exec a transaction
     * @return ECDSAMultiSigElastiVault deployment bytecode
     */
    function _getECDSAMultiSigInitCode(address[] memory signers, uint256 quorum) internal view returns (bytes memory) {
        // determine the target address for contract deployment.
        return abi.encodePacked(type(ECDSAMultiSigElastiVault).creationCode, abi.encode(signers, quorum, hyVM));
    }

    // endregion Internal
}
