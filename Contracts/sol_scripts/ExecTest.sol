// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ElastiVaultFactory} from "../ElastiVaultFactory.sol";

/**
 *  ╔╗  ╔╗╔╗      ╔╗ ╔╗     ╔╗
 *  ║╚╗╔╝╠╝╚╗     ║║ ║║     ║║
 *  ╚╗║║╔╬╗╔╬═╦╦══╣║ ║║  ╔══╣╚═╦══╗
 *   ║╚╝╠╣║║║╔╬╣╔╗║║ ║║ ╔╣╔╗║╔╗║══╣
 *   ╚╗╔╣║║╚╣║║║╚╝║╚╗║╚═╝║╔╗║╚╝╠══║
 *    ╚╝╚╝╚═╩╝╚╩══╩═╝╚═══╩╝╚╩══╩══╝
 */

/**
 * @title ExecTest
 * @author slvrfn
 * @notice An example "script" to be executed on chain in the context of an ElastiVault. This script deploys a new
 *         OwnableElastiVault to a predetermined test-address owner
 */
contract ExecTest {
    function run() public returns (string memory, address) {
        // get an instance of the ElastiVaultFactory
        ElastiVaultFactory factory = ElastiVaultFactory(0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9);

        // perform a contract deployment
        address deployedVault = factory.deployOwnableVaultWithSalt(
            0x0000000000000000000000000000000000000000000018897b204de86ec71600,
            // first hardhat test account
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        );

        return ("Vault Deployed at: ", deployedVault);
    }
}
