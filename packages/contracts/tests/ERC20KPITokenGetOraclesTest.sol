pragma solidity 0.8.17;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {IOraclesManager1} from "carrot/interfaces/oracles-managers/IOraclesManager1.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken} from "../src/interfaces/IERC20KPIToken.sol";
import {TokenAmount} from "carrot/commons/Types.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token get oracles test enumerate test
/// @dev Tests oracles query in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenGetOraclesTest is BaseTestSetup {
    function testNotInitialized() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            Clones.clone(address(erc20KpiTokenTemplate))
        );
        vm.expectRevert(abi.encodeWithSignature("NotInitialized()"));
        kpiTokenInstance.oracles();
    }

    function testSingleOracle() external {
        IERC20KPIToken.Collateral[]
            memory _collaterals = new IERC20KPIToken.Collateral[](1);
        _collaterals[0] = IERC20KPIToken.Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            "Test",
            "TST",
            100 ether
        );

        IERC20KPIToken.OracleData[]
            memory _oracleDatas = new IERC20KPIToken.OracleData[](1);
        _oracleDatas[0] = IERC20KPIToken.OracleData({
            templateId: 1,
            lowerBound: 0,
            higherBound: 1,
            weight: 1,
            value: 0,
            data: abi.encode("")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "d",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "d",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address[] memory oracles = kpiTokenInstance.oracles();
        assertEq(oracles.length, 1);
        assertEq(
            oracles[0],
            oraclesManager.predictInstanceAddress(
                address(this),
                1,
                abi.encode("")
            )
        );
    }

    function testMultipleOracle() external {
        IERC20KPIToken.Collateral[]
            memory _collaterals = new IERC20KPIToken.Collateral[](1);
        _collaterals[0] = IERC20KPIToken.Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            "Test",
            "TST",
            100 ether
        );

        IERC20KPIToken.OracleData[]
            memory _oracleDatas = new IERC20KPIToken.OracleData[](2);
        _oracleDatas[0] = IERC20KPIToken.OracleData({
            templateId: 1,
            lowerBound: 0,
            higherBound: 1,
            weight: 1,
            value: 0,
            data: abi.encode("1")
        });
        _oracleDatas[1] = IERC20KPIToken.OracleData({
            templateId: 1,
            lowerBound: 0,
            higherBound: 1,
            weight: 1,
            value: 0,
            data: abi.encode("2")
        });
        bytes memory _oraclesInitializationData = abi.encode(
            _oracleDatas,
            false
        );

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager
            .predictInstanceAddress(
                address(this),
                1,
                "d",
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            "d",
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        uint256 kpiTokensAmount = factory.kpiTokensAmount();
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(
            factory.enumerate(
                kpiTokensAmount > 0 ? kpiTokensAmount - 1 : kpiTokensAmount,
                kpiTokensAmount > 0 ? kpiTokensAmount : 1
            )[0]
        );

        address[] memory oracles = kpiTokenInstance.oracles();
        assertEq(oracles.length, 2);
        assertEq(
            oracles[0],
            oraclesManager.predictInstanceAddress(
                address(this),
                1,
                abi.encode("1")
            )
        );
        assertEq(
            oracles[1],
            oraclesManager.predictInstanceAddress(
                address(this),
                1,
                abi.encode("2")
            )
        );
    }
}
