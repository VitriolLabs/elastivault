// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TokenReceiver} from "./base/TokenReceiver.sol";
import {ElastiBase} from "./base/ElastiBase.sol";
import {ECDSA} from "@solidstate/contracts/cryptography/ECDSA.sol";
import {ECDSAMultisigWalletInternal} from "@solidstate/contracts/multisig/ECDSAMultisigWalletInternal.sol";
import {ECDSAMultisigWalletStorage} from "@solidstate/contracts/multisig/ECDSAMultisigWalletStorage.sol";
import {EnumerableSet} from "@solidstate/contracts/data/EnumerableSet.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title (ECDSA MultiSig) ElastiVault.
 * @author slvrfn
 * @notice An "elastic" smart contract wallet-vault. This contract allows for dynamic
 *         actions to be executed on the blockchain in the context of the vault.
 * @notice Allows for arbitrary signer(s) to be used for contract ownership
 */
contract ECDSAMultiSigElastiVault is ECDSAMultisigWalletInternal, TokenReceiver, ElastiBase {
    using ECDSAMultisigWalletStorage for ECDSAMultisigWalletStorage.Layout;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @dev Raised when an invalid signer is used to sign a transaction.
     */
    error InvalidSigner();

    /**
     * @notice Sets up this ElastiVault as being owned by an arbitrary signer,
     *         including the base token receiver functions
     * @param signers - The signer(s) to be used to verify valid caller
     * @param quorum - The number of signers required to validate a call.
     * @param vmAddress - The address of the HyVM contract
     */
    constructor(address[] memory signers, uint256 quorum, address vmAddress) ElastiBase(vmAddress) TokenReceiver() {
        uint256 signersLen = signers.length;
        for (uint256 signerIndex; signerIndex < signersLen; ) {
            // attach each signer
            _addSigner(signers[signerIndex]);
            unchecked {
                ++signerIndex;
            }
        }
        // make sure to set quorum
        _setQuorum(quorum);
    }

    /**
     * @notice Checks if a nonce associated with a signer has already been consumed
     * @param signer - The signer to be checked
     * @param nonce - The nonce to be checked
     */
    function nonceInvalidated(address signer, uint256 nonce) external view virtual returns (bool) {
        return _isInvalidNonce(signer, nonce);
    }

    /**
     * @notice Returns the current number of signers required to execute this contract
     */
    function getQuorum() external view virtual returns (uint256) {
        return ECDSAMultisigWalletStorage.layout().quorum;
    }

    /**
     * @notice Returns the current signer associated with this contract
     */
    function getSigners() external view virtual returns (address[] memory) {
        return ECDSAMultisigWalletStorage.layout().signers.toArray();
    }

    /**
     * @notice Checks if a signer is authorized to sign for this contract
     * @param signer - The signer to be checked
     */
    function isSigner(address signer) external view virtual returns (bool) {
        return _isSigner(signer);
    }

    // the following multisig management functions can be called by building a script to execute in the context of this
    //  contract, quorum will need to be met regardless.
    //      _removeSigner
    //      _addSigner
    //      _setQuorum

    /**
     * @notice Allows a signer to invalidate a nonce associated with their account
     * @param signer - The signer's address
     * @param nonce - The nonce to be invalidated
     */
    function invalidateNonce(address signer, uint256 nonce) external {
        // make sure caller is only able to invalidate their own nonce, and they are a current signer
        if (signer != msg.sender || !_isSigner(signer)) {
            revert InvalidSigner();
        }
        _setInvalidNonce(signer, nonce);
    }

    /**
     * @notice Executes arbitrary bytecode on the HyVM in the context of this contract,
     *         if the signatures match the expected quorum to exec the bytecode
     * @param bytecode - The bytecode to be executed.
     * @param signatures - The ERC-191 compatible signature(s).
     * @return The bytes returned after executing the provided bytecode
     */
    function emulate(bytes calldata bytecode, Signature[] memory signatures) external payable returns (bytes memory) {
        // make sure expected signatures were received
        _verifySignatures(bytecode, signatures);
        // exec the provided bytecode
        return _emulate(bytecode);
    }
}
