pragma solidity 0.8.17;

import {InitializeKPITokenParams} from "carrot/commons/Types.sol";
import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../src/ERC20KPIToken.sol";
import {IOraclesManager1} from "carrot/interfaces/oracles-managers/IOraclesManager1.sol";
import {Clones} from "oz/proxy/Clones.sol";
import {IERC20KPIToken, OracleData, Collateral, FinalizableOracle} from "../src/interfaces/IERC20KPIToken.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token collect protocol fee test
/// @dev Tests ERC20 KPI token protocol fee collection.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
contract ERC20KPITokenCollectProtocoFeeTest is BaseTestSetup {
    function initializeKpiToken() internal returns (address, ERC20KPIToken) {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10 ether);
        firstErc20.approve(address(kpiTokenInstance), 10 ether);

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] =
            OracleData({templateId: 1, lowerBound: 0, higherBound: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({
            templateId: 1,
            lowerBound: 5 ether,
            higherBound: 10 ether,
            weight: 3,
            value: 0,
            data: abi.encode("2")
        });
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        address feeReceiver = address(1234);
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: feeReceiver,
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(collaterals, "Token", "TKN", 100 ether),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        return (feeReceiver, kpiTokenInstance);
    }

    function testExcessiveCollection() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10 ether);
        firstErc20.approve(address(kpiTokenInstance), 10 ether);

        Collateral[] memory collaterals = new Collateral[](1);
        collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 9.9999999999 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] =
            OracleData({templateId: 1, lowerBound: 0, higherBound: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({
            templateId: 1,
            lowerBound: 5 ether,
            higherBound: 10 ether,
            weight: 3,
            value: 0,
            data: abi.encode("2")
        });
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        vm.expectRevert(abi.encodeWithSignature("InvalidMinimumPayoutAfterFee()"));
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: address(1234),
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(collaterals, "Token", "TKN", 100 ether),
                oraclesData: abi.encode(oracleData, false)
            })
        );
    }

    function testSuccessSingleCollateral() external {
        (, ERC20KPIToken kpiTokenInstance) = initializeKpiToken();

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 1);

        Collateral memory onChainCollateral = onChainCollaterals[0];

        assertEq(onChainCollateral.token, address(firstErc20));
        assertEq(onChainCollateral.amount, 9.97 ether);
        assertEq(onChainCollateral.minimumPayout, 1 ether);

        vm.clearMockedCalls();
    }

    function testSuccessMultipleCollateral() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));

        firstErc20.mint(address(this), 10 ether);
        firstErc20.approve(address(kpiTokenInstance), 10 ether);

        secondErc20.mint(address(this), 3 ether);
        secondErc20.approve(address(kpiTokenInstance), 3 ether);

        Collateral[] memory collaterals = new Collateral[](2);
        collaterals[0] = Collateral({token: address(firstErc20), amount: 10 ether, minimumPayout: 1 ether});
        collaterals[1] = Collateral({token: address(secondErc20), amount: 3 ether, minimumPayout: 2 ether});

        OracleData[] memory oracleData = new OracleData[](2);
        oracleData[0] =
            OracleData({templateId: 1, lowerBound: 0, higherBound: 1, weight: 1, value: 0, data: abi.encode("1")});
        oracleData[1] = OracleData({
            templateId: 1,
            lowerBound: 5 ether,
            higherBound: 10 ether,
            weight: 3,
            value: 0,
            data: abi.encode("2")
        });
        address oraclesManager = address(2);
        vm.mockCall(
            oraclesManager, abi.encodeWithSignature("instantiate(address,uint256,bytes)"), abi.encode(address(2))
        );

        address feeReceiver = address(42);
        kpiTokenInstance.initialize(
            InitializeKPITokenParams({
                creator: address(this),
                oraclesManager: address(oraclesManager),
                kpiTokensManager: address(kpiTokensManager),
                feeReceiver: feeReceiver,
                kpiTokenTemplateId: 1,
                kpiTokenTemplateVersion: 1,
                description: "a",
                expiration: block.timestamp + 60,
                kpiTokenData: abi.encode(collaterals, "Token", "TKN", 100 ether),
                oraclesData: abi.encode(oracleData, false)
            })
        );

        (Collateral[] memory onChainCollaterals,,,) =
            abi.decode(kpiTokenInstance.data(), (Collateral[], FinalizableOracle[], bool, uint256));

        assertEq(onChainCollaterals.length, 2);

        assertEq(onChainCollaterals[0].token, address(firstErc20));
        assertEq(onChainCollaterals[0].amount, 9.97 ether);
        assertEq(onChainCollaterals[0].minimumPayout, 1 ether);

        assertEq(onChainCollaterals[1].token, address(secondErc20));
        assertEq(onChainCollaterals[1].amount, 2.991 ether);
        assertEq(onChainCollaterals[1].minimumPayout, 2 ether);

        vm.clearMockedCalls();
    }
}
