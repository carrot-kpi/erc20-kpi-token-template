pragma solidity 0.8.23;

import {Test} from "forge-std/Test.sol";
import {ERC20Mintable} from "src/Dependencies.sol";
import {ERC20KPIToken, JIT_FUNDING_FEATURE_ID} from "../../src/ERC20KPIToken.sol";
import {KPITokensManager} from "carrot/KPITokensManager.sol";
import {OraclesManager} from "carrot/OraclesManager.sol";
import {KPITokensFactory} from "carrot/KPITokensFactory.sol";
import {BaseTemplatesManager} from "carrot/BaseTemplatesManager.sol";
import {IBaseTemplatesManager} from "carrot/interfaces/IBaseTemplatesManager.sol";
import {IERC20KPIToken, Reward, OracleData} from "../../src/interfaces/IERC20KPIToken.sol";
import {MockOracle} from "tests/mocks/MockOracle.sol";
import {ERC1967Proxy} from "oz/proxy/ERC1967/ERC1967Proxy.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title Base test setup
/// @dev Test hook to set up a base test environment for each test.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
abstract contract BaseTestSetup is Test {
    string internal constant ERC20_KPI_TOKEN_SPECIFICATION = "test-specification-erc20";
    uint256 internal constant FEE = 10_000; // 1%

    address internal owner;
    ERC20Mintable internal firstErc20;
    ERC20Mintable internal secondErc20;
    address internal feeReceiver;
    KPITokensFactory internal factory;
    ERC20KPIToken internal erc20KpiTokenTemplate;
    KPITokensManager internal kpiTokensManager;
    OraclesManager internal oraclesManager;

    function setUp() external {
        firstErc20 = new ERC20Mintable("Token 1", "TKN1", 18);
        secondErc20 = new ERC20Mintable("Token 2", "TKN2", 18);

        feeReceiver = address(400);
        owner = address(this);
        factory = initializeKPITokensFactory(address(1), address(1), feeReceiver);
        factory.setPermissionless(true);

        erc20KpiTokenTemplate = new ERC20KPIToken(FEE);
        kpiTokensManager = initializeKPITokensManager(address(factory));
        kpiTokensManager.addTemplate(address(erc20KpiTokenTemplate), ERC20_KPI_TOKEN_SPECIFICATION);

        oraclesManager = initializeOraclesManager(address(factory));
        oraclesManager.addTemplate(address(new MockOracle()), "test-specification-mock");

        factory.setKpiTokensManager(address(kpiTokensManager));
        factory.setOraclesManager(address(oraclesManager));
    }

    function initializeKPITokensFactory(address _kpiTokensManager, address _oraclesManager, address _feeReceiver)
        internal
        returns (KPITokensFactory)
    {
        KPITokensFactory _factory = new KPITokensFactory();
        ERC1967Proxy _proxy = new ERC1967Proxy(
            address(_factory),
            abi.encodeWithSelector(
                KPITokensFactory.initialize.selector, owner, _kpiTokensManager, _oraclesManager, _feeReceiver
            )
        );
        return KPITokensFactory(address(_proxy));
    }

    function initializeOraclesManager(address _factory) internal returns (OraclesManager) {
        OraclesManager _manager = new OraclesManager();
        ERC1967Proxy _proxy = new ERC1967Proxy(
            address(_manager), abi.encodeWithSelector(BaseTemplatesManager.initialize.selector, owner, _factory)
        );
        return OraclesManager(address(_proxy));
    }

    function initializeKPITokensManager(address _factory) internal returns (KPITokensManager) {
        KPITokensManager _manager = new KPITokensManager();
        ERC1967Proxy _proxy = new ERC1967Proxy(
            address(_manager), abi.encodeWithSelector(BaseTemplatesManager.initialize.selector, owner, _factory)
        );
        return KPITokensManager(address(_proxy));
    }

    function createKpiToken(string memory _description, bool _justInTimeFunding) public returns (ERC20KPIToken) {
        Reward[] memory _rewards = new Reward[](1);
        _rewards[0] = Reward({token: address(firstErc20), amount: 2, minimumPayout: 1});
        bytes memory _erc20KpiTokenInitializationData =
            abi.encode(_rewards, "Test", "TST", 100 ether, _justInTimeFunding);

        OracleData[] memory _oracleDatas = new OracleData[](1);
        _oracleDatas[0] = OracleData({templateId: 1, weight: 1, value: 0, data: abi.encode("")});
        bytes memory _oraclesInitializationData = abi.encode(_oracleDatas, false);

        firstErc20.mint(address(this), 2);
        address _predictedKpiTokenAddress = kpiTokensManager.predictInstanceAddress(
            address(this),
            1,
            _description,
            block.timestamp + 60,
            _erc20KpiTokenInitializationData,
            _oraclesInitializationData
        );
        firstErc20.approve(_predictedKpiTokenAddress, 2.02 ether);

        if (_justInTimeFunding) {
            IBaseTemplatesManager(kpiTokensManager).enableTemplateFeatureFor(1, JIT_FUNDING_FEATURE_ID, address(this));
        }
        factory.createToken(
            1, _description, block.timestamp + 60, _erc20KpiTokenInitializationData, _oraclesInitializationData
        );

        return ERC20KPIToken(_predictedKpiTokenAddress);
    }
}
