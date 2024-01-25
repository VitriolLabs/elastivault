// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@solidstate/contracts/interfaces/IERC20.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title CallTestGoerli.sol
 * @author slvrfn
 * @notice An example "script" to be executed on chain in the context of an ElastiVault. This script loads the value of
 *         a sample erc20 token on the Goerli testnet
 */
contract CallTestGoerli {
    function run() public view returns (string memory, uint256) {
        // sample token
        IERC20 token = IERC20(0x904609375980165691D587386A0163aa7d8D00A6);
        // get balance, and return it
        uint256 balance = token.balanceOf(0xEb390e921A349e2434871D989c9AD74bB8de10c0);
        return ("The balance is: ", balance);
    }
}
