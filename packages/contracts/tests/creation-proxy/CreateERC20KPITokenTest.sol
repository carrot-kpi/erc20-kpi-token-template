pragma solidity 0.8.17;

import {BaseTestSetup} from "../commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {CreationProxy} from "../../src/CreationProxy.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";
import {ICreationProxy} from "../../src/interfaces/ICreationProxy.sol";
import {Template} from "carrot/interfaces/IBaseTemplatesManager.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Creation proxy create ERC20 KPI token test
/// @dev Tests create ERC20 KPI token in creation proxy.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract CreationProxyCreateERC20KPITokenTest is BaseTestSetup {
    function testSuccess() external {
        string memory _description = "test";
        uint256 _expiration = block.timestamp + 100;

        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2 ether,
            minimumPayout: 1 ether
        });

        string memory _erc20Name = "Test token";
        string memory _erc20Symbol = "TST";
        uint256 _erc20Supply = 1_000 ether;

        OracleData[] memory _oracleData = new OracleData[](1);
        _oracleData[0] = OracleData({
            templateId: 1,
            lowerBound: 0,
            higherBound: 1,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleData,
            false
        );

        firstErc20.mint(address(this), 2 ether);
        firstErc20.approve(address(creationProxy), 2 ether);
        IERC20KPIToken _kpiToken = IERC20KPIToken(
            creationProxy.createERC20KPIToken(
                _description,
                _expiration,
                _collaterals,
                _erc20Name,
                _erc20Symbol,
                _erc20Supply,
                _oraclesInitializationData
            )
        );

        assertEq(_kpiToken.owner(), address(this));

        Template memory _templateFromKpiToken = _kpiToken.template();
        assertEq(_templateFromKpiToken.addrezz, address(erc20KpiTokenTemplate));
        assertEq(_templateFromKpiToken.version, 1);
        assertEq(_templateFromKpiToken.id, 1);
        assertEq(
            _templateFromKpiToken.specification,
            ERC20_KPI_TOKEN_SPECIFICATION
        );

        assertEq(_kpiToken.description(), _description);
        assertEq(_kpiToken.finalized(), false);
        assertEq(_kpiToken.expiration(), _expiration);

        (
            Collateral[] memory _onchainCollaterals,
            FinalizableOracle[] memory _finalizableOracles,
            bool _allOrNone,
            uint256 _initialSupply,
            string memory _name,
            string memory _symbol
        ) = abi.decode(
                _kpiToken.data(),
                (
                    Collateral[],
                    FinalizableOracle[],
                    bool,
                    uint256,
                    string,
                    string
                )
            );

        assertEq(_onchainCollaterals.length, 1);
        assertEq(_onchainCollaterals[0].token, _collaterals[0].token);
        assertEq(_onchainCollaterals[0].amount, 1.994 ether);
        assertEq(
            _onchainCollaterals[0].minimumPayout,
            _collaterals[0].minimumPayout
        );

        assertEq(_finalizableOracles.length, 1);
        assertEq(_finalizableOracles[0].lowerBound, 0);
        assertEq(_finalizableOracles[0].higherBound, 1);
        assertEq(_finalizableOracles[0].finalResult, 0);
        assertEq(_finalizableOracles[0].weight, 1);
        assertEq(_finalizableOracles[0].finalized, false);

        assertEq(_allOrNone, false);
        assertEq(_initialSupply, _erc20Supply);
        assertEq(_name, _erc20Name);
        assertEq(_symbol, _erc20Symbol);

        assertEq(_kpiToken.oracles().length, 1);
    }
}
