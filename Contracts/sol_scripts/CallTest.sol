// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OwnableElastiVault} from "../OwnableElastiVault.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title CallTest.sol
 * @author slvrfn
 * @notice An example "script" to be executed on chain in the context of an ElastiVault. This script checks the owner
 *         of a OwnableElastiVault
 */
contract CallTest {
    function run() public view returns (string memory, address) {
        // create instance of a controlled OwnableElastiVault
        OwnableElastiVault token = OwnableElastiVault(payable(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0));
        // get owner, and return it
        return ("The owner is: ", token.owner());
    }
}
