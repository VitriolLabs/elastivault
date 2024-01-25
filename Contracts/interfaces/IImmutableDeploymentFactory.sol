// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title IImmutableDeploymentFactory
 * @dev Interface for contracts that will be needing to call the
 * immutable deployment factory.
 */
interface IImmutableDeploymentFactory {

    /**
     * @dev Create a contract using CREATE2 by submitting a given salt or nonce
     * along with the initialization code for the contract. Note that the first 20
     * bytes of the salt must match those of the calling address, which prevents
     * contract creation events from being submitted by unintended parties.
     * @param salt bytes32 The nonce that will be passed into the CREATE2 call.
     * @param initializationCode bytes The initialization code that will be passed
     * into the CREATE2 call.
     * @return deploymentAddress Address of the contract that will be created, or the null address
     * if a contract already exists at that address.
     */
    function safeCreate2(bytes32 salt, bytes calldata initializationCode) external payable returns (address deploymentAddress);

    /**
     * @dev Compute the address of the contract that will be created when
     * submitting a given salt or nonce to the contract along with the contract's
     * initialization code. The CREATE2 address is computed in accordance with
     * EIP-1014, and adheres to the formula therein of
     * `keccak256( 0xff ++ address ++ salt ++ keccak256(init_code)))[12:]` when
     * performing the computation. The computed address is then checked for any
     * existing contract code - if so, the null address will be returned instead.
     * @param salt bytes32 The nonce passed into the CREATE2 address calculation.
     * @param initCode bytes The contract initialization code to be used.
     * that will be passed into the CREATE2 address calculation.
     * @return deploymentAddress Address of the contract that will be created, or the null address
     * if a contract has already been deployed to that address.
     */
    function findCreate2Address(bytes32 salt, bytes calldata initCode) external view returns (address deploymentAddress);

    /**
     * @dev Compute the address of the contract that will be created when
     * submitting a given salt or nonce to the contract along with the keccak256
     * hash of the contract's initialization code. The CREATE2 address is computed
     * in accordance with EIP-1014, and adheres to the formula therein of
     * `keccak256( 0xff ++ address ++ salt ++ keccak256(init_code)))[12:]` when
     * performing the computation. The computed address is then checked for any
     * existing contract code - if so, the null address will be returned instead.
     * @param salt bytes32 The nonce passed into the CREATE2 address calculation.
     * @param initCodeHash bytes32 The keccak256 hash of the initialization code
     * that will be passed into the CREATE2 address calculation.
     * @return deploymentAddress Address of the contract that will be created, or the null address
     * if a contract has already been deployed to that address.
     */
    function findCreate2AddressViaHash(bytes32 salt, bytes32 initCodeHash) external view returns (address deploymentAddress);

    /**
     * @dev Create a contract using CRREATE3 (CREATE2 + CREATE) by submitting a given salt.
     * Note that the first 20 bytes of the salt must either: match those of the calling address,
     * or be all 0's. This (optionally)prevents contract creation events from being submitted by
     * unintended parties.
     * @param salt bytes32 The nonce that will be passed into the CREATE2 call.
     * @param initializationCode bytes The initialization code of the contract to be completed.
     * @return deploymentAddress Address of the contract that will be created, or the null address
     * if a contract already exists at that address.
     */
    function safeCreate3(bytes32 salt, bytes calldata initializationCode) external payable returns (address deploymentAddress);

    /**
     * @dev Compute the address of the contract that will be created when
     * submitting a given salt. The CREATE3 address is computed by combining
     * both CREATE2 & CREATE methods: `keccak256(0xd6 ++ 0x94 ++ create2Address(salt, CREATE_CALLER_PROXY_HASH) ++ 0x01)[12:]`
     * when performing the computation. The computed address is then checked for any
     * existing contract code - if so, the null address will be returned instead.
     * @param salt bytes32 The nonce passed into the CREATE3 address calculation.
     * @return deploymentAddress Address of the contract that will be created, or the null address
     * if a contract has already been deployed to that address.
     */
    function findCreate3Address(bytes32 salt) external view returns (address deploymentAddress);
}
