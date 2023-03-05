pragma solidity 0.8.17;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CreationProxy} from "../src/CreationProxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Deploy creation proxy
/// @dev Deploys the creation proxy on a target network.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract DeployCreationProxy is Script {
    function run(address _factory, address _kpiTokensManager, uint256 _templateId) external returns (address) {
        // generate chain specific contracts
        string[] memory _codegenInputs = new string[](6);
        _codegenInputs[0] = "node";
        _codegenInputs[1] = string.concat(vm.projectRoot(), "/codegen-chain-specific-contracts.js");
        _codegenInputs[2] = vm.toString(block.chainid);
        _codegenInputs[3] = vm.toString(_factory);
        _codegenInputs[4] = vm.toString(_kpiTokensManager);
        _codegenInputs[5] = vm.toString(_templateId);
        vm.ffi(_codegenInputs);

        // build chain specific contracts
        string[] memory _buildInputs = new string[](2);
        _buildInputs[0] = "forge";
        _buildInputs[1] = "build";
        vm.ffi(_buildInputs);

        bytes memory _bytecode =
            vm.getCode(string.concat("CreationProxy", vm.toString(block.chainid), ".sol:CreationProxy"));

        address _deployed;
        vm.broadcast();
        assembly {
            _deployed := create(0, add(_bytecode, 0x20), mload(_bytecode))
        }

        console2.log("Creation proxy deployed at address", _deployed);

        return _deployed;
    }
}
