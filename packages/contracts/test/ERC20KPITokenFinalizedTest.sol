pragma solidity 0.8.21;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";
import {TokenAmount} from "carrot/commons/Types.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token finalized enumerate test
/// @dev Tests oracles query in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenFinalizedTest is BaseTestSetup {
    function testSingleOracleNotFinalized() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        assertTrue(!ERC20KPIToken(_predictedKpiTokenAddress).finalized());
    }

    function testSingleOracleFinalized() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        vm.prank(ERC20KPIToken(_predictedKpiTokenAddress).oracles()[0]);
        ERC20KPIToken(_predictedKpiTokenAddress).finalize(12);

        assertTrue(ERC20KPIToken(_predictedKpiTokenAddress).finalized());
    }

    function testMultipleOracleNotFinalized() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        assertTrue(!ERC20KPIToken(_predictedKpiTokenAddress).finalized());
    }

    function testMultipleOracleOneNotFinalized() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        vm.prank(ERC20KPIToken(_predictedKpiTokenAddress).oracles()[0]);
        ERC20KPIToken(_predictedKpiTokenAddress).finalize(12);

        assertTrue(!ERC20KPIToken(_predictedKpiTokenAddress).finalized());
    }

    function testMultipleOracleAllFinalized() external {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData = abi.encode(_collaterals, "Test", "TST", 100 ether);

        OracleData[] memory _oracleDatas = new OracleData[](2);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("1")});
        _oracleDatas[1] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("2")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this), 1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(1, "d", block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData);

        vm.prank(ERC20KPIToken(_predictedKpiTokenAddress).oracles()[0]);
        ERC20KPIToken(_predictedKpiTokenAddress).finalize(12);
        vm.prank(ERC20KPIToken(_predictedKpiTokenAddress).oracles()[1]);
        ERC20KPIToken(_predictedKpiTokenAddress).finalize(12);

        assertTrue(ERC20KPIToken(_predictedKpiTokenAddress).finalized());
    }
}
