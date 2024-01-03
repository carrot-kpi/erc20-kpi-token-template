pragma solidity >=0.8.0;

import {IERC20} from "oz/token/ERC20/IERC20.sol";
import {IKPIToken} from "carrot/interfaces/IKPIToken.sol";

struct OracleData {
    uint256 templateId;
    uint256 weight;
    uint256 value;
    bytes data;
}

struct Reward {
    address token;
    uint256 amount;
    uint256 minimumPayout;
}

struct RewardWithoutToken {
    uint256 amount;
    uint256 minimumPayout;
    uint256 postFinalizationAmount;
    mapping(address => uint256) redeemedBy;
}

struct FinalizableOracle {
    address addrezz;
    uint256 weight;
    uint256 finalResult;
    bool finalized;
}

struct FinalizableOracleWithoutAddress {
    uint256 weight;
    uint256 finalResult;
    bool finalized;
}

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token interface
/// @dev Interface for the ERC20 KPI token contract.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
interface IERC20KPIToken is IKPIToken, IERC20 {
    function recoverERC20(address _token, address _receiver) external;

    function registerRedemption() external;

    function redeemReward(address _token, address _receiver) external;
}
