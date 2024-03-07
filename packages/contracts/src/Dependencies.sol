pragma solidity 0.8.23;

import {ERC20} from "oz/token/ERC20/ERC20.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @dev Specified fork and tests dependencies.
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20Mintable is ERC20 {
    uint8 public immutable dec;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol) {
        dec = _decimals;
    }

    function decimals() public view override returns (uint8) {
        return dec;
    }

    function mint(address _account, uint256 _value) external {
        _mint(_account, _value);
    }
}
