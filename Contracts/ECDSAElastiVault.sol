// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TokenReceiver} from "./base/TokenReceiver.sol";
import {ElastiBase} from "./base/ElastiBase.sol";
import {SignerStorage} from "./storage/SignerStorage.sol";
import {ECDSA} from "@solidstate/contracts/cryptography/ECDSA.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title (ECDSA) ElastiVault.
 * @author slvrfn
 * @notice An "elastic" smart contract wallet-vault. This contract allows for dynamic
 *         actions to be executed on the blockchain in the context of the vault.
 * @notice Allows for arbitrary signer to be used for contract ownership
 */
contract ECDSAElastiVault is TokenReceiver, ElastiBase {
    using SignerStorage for SignerStorage.Layout;

    /**
     * @dev Raised when an invalid signer is used to sign a transaction.
     */
    error InvalidSigner();

    /**
     * @notice Sets up this ElastiVault as being owned by an arbitrary signer,
     *         including the base token receiver functions
     * @param signer - The signer to be used to verify valid caller
     * @param vmAddress - The address of the HyVM contract
     */
    constructor(address signer, address vmAddress) ElastiBase(vmAddress) TokenReceiver() {
        // setup address to be used for validating contract caller
        SignerStorage.Layout storage s = SignerStorage.layout();
        s.signer = signer;
    }

    /**
     * @notice Returns the current signer associated with this contract
     */
    function getSigner() external view virtual returns (address) {
        return SignerStorage.layout().signer;
    }

    /**
     * @notice Executes arbitrary bytecode on the HyVM in the context of this contract,
     *         if the caller is the expected signer of the bytecode
     * @param bytecode - The bytecode to be executed.
     * @param signature - The ERC-191 compatible signature.
     * @return The bytes returned after executing the provided bytecode
     */
    function emulate(bytes calldata bytecode, bytes memory signature) external payable returns (bytes memory) {
        // hash the passed bytecode
        bytes32 bytecodeHash = keccak256(bytecode);
        // get the signer of the passed bytecode, expecting the sig to be in ERC-191 format
        address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(bytecodeHash), signature);
        // make sure expected signer was used
        if (signer != SignerStorage.layout().signer) {
            revert InvalidSigner();
        }
        // exec the provided bytecode
        return _emulate(bytecode);
    }
}
