// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VMStorage} from "../storage/VMStorage.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title ElastiBase.
 * @author slvrfn
 * @notice An abstract contract house the shared logic of an ElastiVault across its various auth-derived implementations.
 */
abstract contract ElastiBase {
    using VMStorage for VMStorage.Layout;

    constructor(address vmAddress) {
        // setup address to be used for executing arbitrary bytecode
        VMStorage.Layout storage d = VMStorage.layout();
        d.vmAddress = vmAddress;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    // solhint-disable-next-line no-empty-blocks
    fallback() external payable {}

    /**
     * @notice Executes arbitrary bytecode on the HyVM in the context of this contract.
     * @param bytecode - The bytecode to be executed.
     * @return The bytes returned after executing the provided bytecode
     */
    function _emulate(bytes calldata bytecode) internal virtual returns (bytes memory) {
        VMStorage.Layout storage d = VMStorage.layout();

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = d.vmAddress.delegatecall(bytecode);

        if (success) {
            return returnData;
        } else {
            assembly {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
}
