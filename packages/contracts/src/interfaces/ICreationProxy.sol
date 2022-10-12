pragma solidity >=0.8.0;

import {Collateral} from "./IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Creation proxy
/// @dev Interface for the creation proxy.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
interface ICreationProxy {
    function createERC20KPIToken(
        string memory _description,
        uint256 _expiration,
        Collateral[] memory _collaterals,
        string memory _erc20Name,
        string memory _erc20Symbol,
        uint256 _erc20Supply,
        bytes memory _oraclesInitializationData
    ) external payable returns (address);
}
