pragma solidity 0.8.17;

import {IKPITokenTemplate} from "./interfaces/IKPITokenTemplate.sol";
import {Template} from "carrot/interfaces/IBaseTemplatesManager.sol";
import {InitializeKPITokenParams} from "carrot/commons/Types.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title KPI token template implementation
/// @dev A KPI token template implementation
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract KPITokenTemplate is IKPITokenTemplate {
    function initialize(InitializeKPITokenParams memory _params)
        external
        payable
        override
    {}

    function finalize(uint256 _result) external override {}

    function redeem(bytes memory _data) external override {}

    function owner() external view override returns (address) {
        return address(0);
    }

    function transferOwnership(address _newOwner) external override {}

    function template() external view override returns (Template memory) {
        return
            Template({
                id: 1,
                addrezz: address(0),
                version: 1,
                specification: "foo"
            });
    }

    function description() external view override returns (string memory) {
        return "foo";
    }

    function finalized() external view override returns (bool) {
        return true;
    }

    function expiration() external view override returns (uint256) {
        return block.timestamp;
    }

    function data() external view override returns (bytes memory) {
        return abi.encode();
    }

    function oracles() external view override returns (address[] memory) {
        return new address[](0);
    }
}
