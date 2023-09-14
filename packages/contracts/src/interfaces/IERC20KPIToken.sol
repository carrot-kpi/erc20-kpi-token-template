pragma solidity >=0.8.0;

import {IERC20Upgradeable} from "oz-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {IKPIToken} from "carrot/interfaces/kpi-tokens/IKPIToken.sol";

struct OracleData {
    uint256 templateId;
    uint256 weight;
    uint256 value;
    bytes data;
}

struct Collateral {
    address token;
    uint256 amount;
    uint256 minimumPayout;
}

struct CollateralWithoutToken {
    uint256 amount;
    uint256 minimumPayout;
    uint256 postFinalizationAmount;
    mapping(address => uint256) redeemedBy;
}

struct FinalizableOracle {
    address addrezz;
    uint256 weight;
    bool finalized;
}

struct FinalizableOracleWithoutAddress {
    uint256 weight;
    bool finalized;
}

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token interface
/// @dev Interface for the ERC20 KPI token contract.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
interface IERC20KPIToken is IKPIToken, IERC20Upgradeable {
    function recoverERC20(address _token, address _receiver) external;

    function registerRedemption() external;

    function redeemCollateral(address _token, address _receiver) external;
}
