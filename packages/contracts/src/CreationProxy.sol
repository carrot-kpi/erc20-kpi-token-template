pragma solidity 0.8.17;

import {IERC20} from "oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "oz/token/ERC20/utils/SafeERC20.sol";
import {IKPITokensFactory} from "carrot/interfaces/IKPITokensFactory.sol";
import {IKPITokensManager1} from "carrot/interfaces/kpi-tokens-managers/IKPITokensManager1.sol";
import {IERC20KPIToken, Collateral} from "./interfaces/IERC20KPIToken.sol";
import {ICreationProxy} from "./interfaces/ICreationProxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Creation proxy
/// @dev A proxy contract to improve UX while creating ERC20 KPI tokens. Instead of
/// approving ERC20 tokens used as collaterals to the KPI token address directly,
/// those are approved to this contract which then acts on behalf of the user to
/// create the KPI token with the given parameters. Having this approach makes it
/// possible to approve the tokens to this contract once and potentially reuse the
/// approvals on following reuses.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
// TODO: write more tests
contract CreationProxy is ICreationProxy {
    using SafeERC20 for IERC20;

    // replaced by codegen script
    address public immutable FACTORY_ADDRESS = address(1111111111);
    address public immutable KPI_TOKENS_MANAGER_ADDRESS = address(2222222222);
    uint256 public immutable TEMPLATE_ID = 3333333333;

    error InconsistentAddress();

    event Create(address indexed kpiToken);

    function createERC20KPIToken(
        string memory _description,
        uint256 _expiration,
        Collateral[] memory _collaterals,
        string memory _erc20Name,
        string memory _erc20Symbol,
        uint256 _erc20Supply,
        bytes memory _oraclesInitializationData
    ) external payable override returns (address) {
        bytes memory _initializationData = abi.encode(_collaterals, false, _erc20Name, _erc20Symbol, _erc20Supply);
        address _predictedKpiTokenAddress = IKPITokensManager1(KPI_TOKENS_MANAGER_ADDRESS).predictInstanceAddress(
            address(this), TEMPLATE_ID, _description, _expiration, _initializationData, _oraclesInitializationData
        );
        for (uint8 _i = 0; _i < _collaterals.length; _i++) {
            Collateral memory _collateral = _collaterals[_i];
            IERC20(_collateral.token).safeTransferFrom(msg.sender, _predictedKpiTokenAddress, _collateral.amount);
        }
        address _createdKpiToken = IKPITokensFactory(FACTORY_ADDRESS).createToken{value: msg.value}(
            TEMPLATE_ID, _description, _expiration, _initializationData, _oraclesInitializationData
        );
        if (_predictedKpiTokenAddress != _createdKpiToken) {
            revert InconsistentAddress();
        }
        IERC20KPIToken(_createdKpiToken).transferOwnership(msg.sender);
        IERC20KPIToken(_createdKpiToken).transfer(msg.sender, IERC20KPIToken(_createdKpiToken).balanceOf(address(this)));
        emit Create(_createdKpiToken);
        return _createdKpiToken;
    }
}
