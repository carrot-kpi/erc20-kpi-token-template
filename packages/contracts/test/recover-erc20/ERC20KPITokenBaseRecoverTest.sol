pragma solidity 0.8.23;

import {BaseTestSetup} from "tests/commons/BaseTestSetup.sol";
import {ERC20KPIToken} from "../../src/ERC20KPIToken.sol";
import {IERC20KPIToken, OracleData, Reward, FinalizableOracle} from "../../src/interfaces/IERC20KPIToken.sol";
import {ERC20Mintable} from "src/Dependencies.sol";
import {Clones} from "oz/proxy/Clones.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token recover test
/// @dev Tests recover in ERC20 KPI token.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPITokenBaseRecoverTest is BaseTestSetup {
    function testNotOwner() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("Forbidden()"));
        vm.prank(address(123));
        kpiTokenInstance.recoverERC20(address(33333), address(this));
    }

    function testZeroAddressReceiver() external {
        ERC20KPIToken kpiTokenInstance = ERC20KPIToken(Clones.clone(address(erc20KpiTokenTemplate)));
        vm.expectRevert(abi.encodeWithSignature("ZeroAddressReceiver()"));
        kpiTokenInstance.recoverERC20(address(33333), address(0));
    }

    function testNothingToRecoverReward() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);

        (Reward[] memory _rewards,,,) =
            abi.decode(kpiTokenInstance.data(), (Reward[], FinalizableOracle[], bool, uint256));

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(_rewards[0].token, address(1));
    }

    function testNothingToRecoverToken() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);

        ERC20Mintable token = new ERC20Mintable("Token 1", "TKN1", 18);

        vm.expectRevert(abi.encodeWithSignature("NothingToRecover()"));
        kpiTokenInstance.recoverERC20(address(token), address(1));
    }

    function testRecoverExternalToken() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", false);

        ERC20Mintable token = new ERC20Mintable("Token 1", "TKN1", 18);
        token.mint(address(kpiTokenInstance), 2 ether);

        kpiTokenInstance.recoverERC20(address(token), address(1));

        assertEq(token.balanceOf(address(1)), 2 ether);
    }

    function testRecoverExternalTokenJustInTimeFunding() external {
        IERC20KPIToken kpiTokenInstance = createKpiToken("a", true);

        ERC20Mintable token = new ERC20Mintable("Token 1", "TKN1", 18);
        token.mint(address(kpiTokenInstance), 2 ether);

        kpiTokenInstance.recoverERC20(address(token), address(1));

        assertEq(token.balanceOf(address(1)), 2 ether);
    }
}
