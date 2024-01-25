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
 * @title  VMStorage
 * @author slvrfn
 * @notice Library responsible for loading the associated VMStorage from storage.
 */
library VMStorage {
    bytes32 internal constant STORAGE_SLOT = keccak256("elastivault.libraries.storage.VMStorage");

    struct Layout {
        address vmAddress;
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
