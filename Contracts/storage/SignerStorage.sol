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
 * @title  SignerStorage
 * @author slvrfn
 * @notice Library responsible for loading the associated SignerStorage from storage.
 */
library SignerStorage {
    bytes32 internal constant STORAGE_SLOT = keccak256("elastivault.libraries.storage.SignerStorage");

    struct Layout {
        address signer;
    }

    /**
     * @notice Obtains the layout from storage.
     * @dev    layout is stored at position 0.
     */
    function layout() internal pure returns (Layout storage ds) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            ds.slot := slot
        }
    }
}
