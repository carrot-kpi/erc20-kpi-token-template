pragma solidity 0.8.17;

import {Test} from "forge-std/Test.sol";
import {TransparentUpgradeableProxy} from "oz/proxy/transparent/TransparentUpgradeableProxy.sol";
import {ProxyAdmin} from "oz/proxy/transparent/ProxyAdmin.sol";
import {ERC20PresetMinterPauser} from "oz/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {KPITokensManager1} from "carrot/kpi-tokens-managers/KPITokensManager1.sol";
import {OraclesManager1} from "carrot/oracles-managers/OraclesManager1.sol";
import {KPITokensFactory} from "carrot/KPITokensFactory.sol";
import {IERC20KPIToken, Collateral, OracleData} from "../../src/interfaces/IERC20KPIToken.sol";
import {MockOracle} from "tests/mocks/MockOracle.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Base test setup
/// @dev Test hook to set up a base test environment for each test.
/// @author Federico Luzzi - <federico.luzzi@protonmail.com>
abstract contract BaseTestSetup is Test {
    string internal constant ERC20_KPI_TOKEN_SPECIFICATION =
        "test-specification-erc20";

    ERC20PresetMinterPauser internal firstErc20;
    ERC20PresetMinterPauser internal secondErc20;
    address internal feeReceiver;
    KPITokensFactory internal factory;
    ERC20KPIToken internal erc20KpiTokenTemplate;
    KPITokensManager1 internal kpiTokensManager;
    address internal oraclesManagerImplementation;
    OraclesManager1 internal oraclesManager;
    ProxyAdmin internal oraclesManagerProxyAdmin;
    TransparentUpgradeableProxy internal oraclesManagerProxy;

    function setUp() external {
        firstErc20 = new ERC20PresetMinterPauser("Token 1", "TKN1");
        secondErc20 = new ERC20PresetMinterPauser("Token 2", "TKN2");

        feeReceiver = address(400);
        factory = new KPITokensFactory(address(1), address(1), feeReceiver);

        erc20KpiTokenTemplate = new ERC20KPIToken();
        kpiTokensManager = new KPITokensManager1(address(factory));
        kpiTokensManager.addTemplate(
            address(erc20KpiTokenTemplate),
            ERC20_KPI_TOKEN_SPECIFICATION
        );

        oraclesManager = new OraclesManager1(address(factory));
        oraclesManager.addTemplate(
            address(new MockOracle()),
            "test-specification-mock"
        );

        factory.setKpiTokensManager(address(kpiTokensManager));
        factory.setOraclesManager(address(oraclesManager));
    }

    function createKpiToken(string memory _description)
        public
        returns (ERC20KPIToken)
    {
        Collateral[] memory _collaterals = new Collateral[](1);
        _collaterals[0] = Collateral({
            token: address(firstErc20),
            amount: 2,
            minimumPayout: 1
        });
        bytes memory _erc20KpiTokenInitializationData = abi.encode(
            _collaterals,
            true,
            "Test",
            "TST",
            100 ether
        );

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({
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
                _description,
                block.timestamp + 60,
                _erc20KpiTokenInitializationData,
                _oraclesInitializationData
            );
        firstErc20.approve(_predictedKpiTokenAddress, 2);

        factory.createToken(
            1,
            _description,
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );

        return ERC20KPIToken(_predictedKpiTokenAddress);
    }
}
