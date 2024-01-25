// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {SafeOwnable} from "@solidstate/contracts/access/ownable/SafeOwnable.sol";
import {ERC165Base} from "@solidstate/contracts/introspection/ERC165/base/ERC165Base.sol";
import {ISafeOwnable} from "@solidstate/contracts/access/ownable/ISafeOwnable.sol";
import {TokenReceiver} from "./base/TokenReceiver.sol";
import {ElastiBase} from "./base/ElastiBase.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title (Ownable) ElastiVault.
 * @author slvrfn
 * @notice An "elastic" smart contract wallet/vault. This vault allows for dynamic
 *         actions to be executed on the blockchain in the context of the vault.
 * @notice Utilizes the SafeOwnable standard for contract ownership
 */
contract OwnableElastiVault is SafeOwnable, ERC165Base, TokenReceiver, ElastiBase {
    /**
     * @notice Sets up this ElastiVault as being owned by 1 account (SafeOwnable),
     *         including the base token receiver functions
     */
    constructor(address owner, address vmAddress) ElastiBase(vmAddress) TokenReceiver() {
        // register interfaces
        _setSupportsInterface(type(ISafeOwnable).interfaceId, true);
        // make sure to set owner
        _setOwner(owner);
    }

    /**
     * @notice Executes arbitrary bytecode on the HyVM in the context of this contract,
     *         if the caller is the current contract owner.
     * @param bytecode - The bytecode to be executed.
     * @return The bytes returned after executing the provided bytecode
     */
    function emulate(bytes calldata bytecode) external payable onlyOwner returns (bytes memory) {
        return _emulate(bytecode);
    }
}
