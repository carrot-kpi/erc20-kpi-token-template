pragma solidity 0.8.21;

import {ERC20Upgradeable} from "oz-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IERC20} from "oz/token/ERC20/IERC20.sol";
import {SafeERC20} from "oz/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuardUpgradeable} from "oz-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IOraclesManager} from "carrot/interfaces/IOraclesManager.sol";
import {Template, IBaseTemplatesManager} from "carrot/interfaces/IBaseTemplatesManager.sol";
import {
    IERC20KPIToken,
    Collateral,
    OracleData,
    CollateralWithoutToken,
    FinalizableOracle,
    FinalizableOracleWithoutAddress
} from "./interfaces/IERC20KPIToken.sol";
import {TokenAmount, InitializeKPITokenParams} from "carrot/commons/Types.sol";

/// SPDX-License-Identifier: GPL-3.0-or-later
/// @title ERC20 KPI token template implementation
/// @dev A KPI token template implementation. The template produces ERC20 tokens
/// that can be distributed arbitrarily to communities or specific entities in order
/// to incentivize them to reach certain goals. Backing these tokens there are potentially
/// a multitude of other ERC20 tokens (up to 5), the release of which is linked to
/// reaching the predetermined goals. In order to check if these goals are reached
/// on-chain, oracles are employed, and based on the results conveyed back to
/// the KPI token template, the collaterals are either unlocked, sent back to the
/// KPI token owner, or a mix of the 2. Interesting logic is additionally tied to
/// the conditions and collaterals, such as the possibility to have a minimum
/// payout (a per-collateral sum that will always be paid out to KPI token holders
/// regardless of the fact that goals are reached or not), weighted conditions and
/// multiple detached resolution or all-in-one reaching of goals (explained more in
/// detail later).
/// @author Federico Luzzi - <federico.luzzi@carrot-labs.xyz>
contract ERC20KPIToken is ERC20Upgradeable, IERC20KPIToken, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    uint256 internal constant INVALID_ANSWER = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    uint256 internal constant MULTIPLIER = 64;
    uint256 internal constant UNIT = 1_000_000;

    uint256 public immutable fee;

    bool internal allOrNone;
    uint16 internal toBeFinalized;
    address public owner;
    uint8 internal oraclesAmount;
    uint8 internal collateralsAmount;
    address internal kpiTokensManager;
    uint128 internal kpiTokenTemplateVersion;
    uint256 internal kpiTokenTemplateId;
    string public description;
    uint256 public expiration;
    uint256 public creationTimestamp;
    uint256 internal initialSupply;
    uint256 internal totalWeight;
    mapping(address => FinalizableOracleWithoutAddress) internal finalizableOracleByAddress;
    mapping(uint256 => address) internal finalizableOracleAddressByIndex;
    mapping(address => CollateralWithoutToken) internal collateral;
    mapping(uint256 => address) internal collateralAddressByIndex;
    mapping(address => uint256) internal registeredBurn;

    error InvalidFee();
    error Forbidden();
    error NotInitialized();
    error InvalidCollateral();
    error InvalidFeeReceiver();
    error InvalidOraclesManager();
    error InvalidOracleBounds();
    error InvalidOracleWeights();
    error InvalidExpiration();
    error InvalidDescription();
    error TooManyCollaterals();
    error TooManyOracles();
    error InvalidName();
    error InvalidSymbol();
    error InvalidTotalSupply();
    error InvalidCreator();
    error InvalidKpiTokensManager();
    error InvalidMinimumPayoutAfterFee();
    error DuplicatedCollateral();
    error NotEnoughCollateral();
    error NoOracles();
    error NoCollaterals();
    error NothingToRedeem();
    error ZeroAddressToken();
    error ZeroAddressReceiver();
    error ZeroAddressOwner();
    error NothingToRecover();
    error NotEnoughValue();

    event CollectProtocolFee(address indexed token, uint256 amount, address indexed receiver);
    event RecoverERC20(address indexed token, uint256 amount, address indexed receiver);
    event Redeem(address indexed account, uint256 burned);
    event RegisterRedemption(address indexed account, uint256 burned);
    event RedeemCollateral(address indexed account, address indexed receiver, address token, uint256 amount);

    constructor(uint256 _fee) {
        if (_fee >= UNIT) revert InvalidFee();
        fee = _fee;
        _disableInitializers();
    }

    /// @dev Initializes the template through the passed in data. This function is
    /// generally invoked by the KPI tokens manager, in turn invoked by the factory,
    /// in turn invoked by a KPI token creator.
    /// @param _params The params are passed in a struct, and are:
    /// - `creator`: the factory forwarded KPI token creator.
    /// - `oraclesManager`: the factory forwarded address of the oracles manager.
    /// - `kpiTokensManager`: the factory forwarded address of the KPI tokens manager.
    /// - `feeReceiver`: the factory forwarded address of the fee receiver.
    /// - `kpiTokenTemplateId`: the id of the template.
    /// - `description`: an IPFS cid pointing to a file describing what the created campaign
    ///    is about
    /// - `expiration`: a timestamp determining the expiration date of the KPI token.
    /// - `kpiTokenData`: an ABI-encoded structure forwarded by the factory from the KPI token
    ///   creator, containing the initialization parameters for the ERC20 KPI token template.
    ///   It's structured in the following way:
    ///     - `Collateral[] memory _collaterals`: an array of `Collateral` structs detailing
    ///       information about the collaterals to be used (a limit of maximum 5 different
    ///       collateral is enforced, and duplicates are not allowed).
    ///     - `string memory _erc20Name`: The name of the created ERC20 token.
    ///     - `string memory _erc20Symbol`: The symbol of the created ERC20 token.
    ///     - `string memory _erc20Supply`: The initial supply of the created ERC20 token.
    /// - `_oraclesData`: an ABI-encoded structure forwarded by the factory from the KPI token
    ///   creator, containing the initialization parameters for the chosen oracle templates.
    ///   In particular the structure is formed in the following way:
    ///   - `OracleData[] memory _oracleDatas`: data about the oracle, such as:
    ///       - `uint256 _templateId`: the id of the chosen oracle template.
    ///       - `uint256 _lowerBound`: the minimum value the oracle can report back for the
    ///         goal attached to it to be considered reached.
    ///       - `uint256 _higherBound`: the value the oracle can report back for the
    ///         goal attached to it to be considered fully reached.
    ///       - `uint256 _weight`: The oracle's weight determines its importance goal and how
    ///         much of the collateral it "governs". If for example we have 2
    ///         oracles A and B with respective weights 1 and 2, a third of the deposited
    ///         collaterals goes towards incentivizing A, while the remaining 2/3rds go
    ///         to B (i.e. the goal defined by the B oracle is valued as a more critical one
    ///         to reach compared to A).
    ///       - `uint256 _data`: ABI-encoded, oracle-specific data used to effectively
    ///         instantiate the oracle.
    ///   - `bool _allOrNone`: Whether all goals should be at least partly reached in
    ///     order to unlock any collaterals to the KPI token holders.
    function initialize(InitializeKPITokenParams memory _params) external payable override initializer {
        initializeState(
            _params.creator,
            _params.kpiTokensManager,
            _params.kpiTokenTemplateId,
            _params.kpiTokenTemplateVersion,
            _params.description,
            _params.expiration,
            _params.kpiTokenData
        );

        (Collateral[] memory _collaterals,,,) =
            abi.decode(_params.kpiTokenData, (Collateral[], string, string, uint256));

        collectCollateralsAndFees(_params.creator, _collaterals, _params.feeReceiver);
        address[] memory _oracles = initializeOracles(_params.creator, _params.oraclesManager, _params.oraclesData);

        emit Initialize(
            _params.creator,
            block.timestamp,
            _params.kpiTokenTemplateId,
            _params.kpiTokenTemplateVersion,
            _params.description,
            _params.expiration,
            _oracles
        );
    }

    /// @dev Utility function used to perform checks and partially initialize the state
    /// of the KPI token. This is only invoked by the more generic `initialize` function.
    /// @param _creator The factory forwarded KPI token creator.
    /// @param _kpiTokensManager The factory forwarded address of the KPI tokens manager.
    /// @param _kpiTokenTemplateId The id of the template.
    /// @param _description An IPFS cid pointing to a structured file describing what the
    /// KPI token is about.
    /// @param _expiration A timestamp determining the expiration date of the KPI token.
    /// @param _data ABI-encoded data used to configura the KPI token (see the doc of the
    /// `initialize` function).
    function initializeState(
        address _creator,
        address _kpiTokensManager,
        uint256 _kpiTokenTemplateId,
        uint128 _kpiTokenTemplateVersion,
        string memory _description,
        uint256 _expiration,
        bytes memory _data
    ) internal onlyInitializing {
        if (bytes(_description).length == 0) revert InvalidDescription();
        if (_expiration <= block.timestamp) revert InvalidExpiration();

        (, string memory _erc20Name, string memory _erc20Symbol, uint256 _erc20Supply) =
            abi.decode(_data, (Collateral[], string, string, uint256));

        if (bytes(_erc20Name).length == 0) revert InvalidName();
        if (bytes(_erc20Symbol).length == 0) revert InvalidSymbol();
        if (_erc20Supply == 0) revert InvalidTotalSupply();

        __ReentrancyGuard_init();
        __ERC20_init(_erc20Name, _erc20Symbol);
        _mint(_creator, _erc20Supply);

        initialSupply = _erc20Supply;
        owner = _creator;
        description = _description;
        expiration = _expiration;
        creationTimestamp = block.timestamp;
        kpiTokensManager = _kpiTokensManager;
        kpiTokenTemplateId = _kpiTokenTemplateId;
        kpiTokenTemplateVersion = _kpiTokenTemplateVersion;
    }

    /// @dev Utility function used to collect collaterals and fees from the KPI token
    /// creator. This is only invoked by the more generic `initialize` function.
    /// @param _creator The KPI token creator.
    /// @param _collaterals The collaterals array as taken from the ABI-encoded data
    /// passed in by the KPI token creator.
    /// @param _feeReceiver The factory forwarded address of the fee receiver.
    function collectCollateralsAndFees(address _creator, Collateral[] memory _collaterals, address _feeReceiver)
        internal
        onlyInitializing
    {
        if (_collaterals.length == 0) revert NoCollaterals();
        if (_collaterals.length > 5) revert TooManyCollaterals();
        if (_feeReceiver == address(0)) revert InvalidFeeReceiver();

        collateralsAmount = uint8(_collaterals.length);

        for (uint8 _i = 0; _i < _collaterals.length; _i++) {
            Collateral memory _collateral = _collaterals[_i];
            uint256 _collateralAmount = _collateral.amount;
            if (
                _collateral.token == address(0) || _collateralAmount == 0
                    || _collateral.minimumPayout >= _collateralAmount
            ) revert InvalidCollateral();
            for (uint8 _j = _i + 1; _j < _collaterals.length; _j++) {
                if (_collateral.token == _collaterals[_j].token) {
                    revert DuplicatedCollateral();
                }
            }
            collateral[_collateral.token].amount = _collateralAmount;
            collateral[_collateral.token].minimumPayout = _collateral.minimumPayout;
            collateral[_collateral.token].postFinalizationAmount = 0;
            collateralAddressByIndex[_i] = _collateral.token;
            uint256 _fee = (_collateralAmount * fee) / UNIT;
            uint256 _collateralAmountPlusFees;
            unchecked {
                _collateralAmountPlusFees = _collateralAmount + _fee;
            }
            IERC20(_collateral.token).safeTransferFrom(_creator, address(this), _collateralAmountPlusFees);
            if (_fee > 0) {
                IERC20(_collateral.token).safeTransfer(_feeReceiver, _fee);
                emit CollectProtocolFee(_collateral.token, _fee, _feeReceiver);
            }
        }
    }

    /// @dev Initializes the oracles tied to this KPI token (both the actual oracle
    /// instantiation and configuration data needed to interpret the relayed result
    /// at the KPI-token level). This function is only invoked by the `initialize` function.
    /// @param _creator The KPI token creator.
    /// @param _oraclesManager The address of the oracles manager, used to instantiate
    /// the oracles.
    /// @param _data ABI-encoded data used to create and configura the oracles (see
    /// the doc of the `initialize` function for more on this).
    function initializeOracles(address _creator, address _oraclesManager, bytes memory _data)
        internal
        onlyInitializing
        returns (address[] memory)
    {
        (OracleData[] memory _oracleDatas, bool _allOrNone) = abi.decode(_data, (OracleData[], bool));

        if (_oracleDatas.length == 0) revert NoOracles();
        if (_oracleDatas.length > 5) revert TooManyOracles();
        oraclesAmount = uint8(_oracleDatas.length);

        uint256 _totalValue = 0;
        for (uint16 _i = 0; _i < _oracleDatas.length; _i++) {
            _totalValue += _oracleDatas[_i].value;
        }
        if (msg.value < _totalValue) revert NotEnoughValue();

        uint256 _totalWeigth = 0;
        address[] memory _oracles = new address[](_oracleDatas.length);
        for (uint16 _i = 0; _i < _oracleDatas.length; _i++) {
            OracleData memory _oracleData = _oracleDatas[_i];
            if (_oracleData.weight == 0) revert InvalidOracleWeights();
            _totalWeigth += _oracleData.weight;
            address _instance = IOraclesManager(_oraclesManager).instantiate{value: _oracleData.value}(
                _creator, _oracleData.templateId, _oracleData.data
            );
            _oracles[_i] = _instance;
            finalizableOracleByAddress[_instance] =
                FinalizableOracleWithoutAddress({weight: _oracleData.weight, finalResult: 0, finalized: false});
            finalizableOracleAddressByIndex[_i] = _instance;
        }

        totalWeight = _totalWeigth;
        toBeFinalized = uint16(_oracleDatas.length);
        allOrNone = _allOrNone;

        return _oracles;
    }

    /// @dev Returns a storage pointer to the `FinalizableOracle` struct
    /// associated with the given address, and reverts if there's none.
    /// @param _address The finalizable oracle address.
    /// @return The `FinalizableOracle` associated with the given address.
    function finalizableOracle(address _address) internal view returns (FinalizableOracleWithoutAddress storage) {
        FinalizableOracleWithoutAddress storage _finalizableOracle = finalizableOracleByAddress[_address];
        if (_finalizableOracle.weight == 0 || _finalizableOracle.finalized) {
            revert Forbidden();
        }
        return _finalizableOracle;
    }

    /// @dev Transfers ownership of the KPI token. The owner is the one that has a claim
    /// over the unused, leftover collateral on finalization.
    /// @param _newOwner The new owner.
    // TODO: add tests
    function transferOwnership(address _newOwner) external override {
        if (_newOwner == address(0)) revert ZeroAddressOwner();
        address _owner = owner;
        if (msg.sender != _owner) revert Forbidden();
        owner = _newOwner;
        emit OwnershipTransferred(_owner, _newOwner);
    }

    /// @dev Used by oracles linked to the KPI token to communicate their finalization.
    ///
    /// This function is exclusively callable by oracles linked with the KPI token in
    /// order to report the final outcome (in goal completion percentage in parts per
    /// million) for an unlocking condition once everything has played out "in the real
    /// world".
    /// Based on the reported percentage and the KPI token's configuration, collateral is
    /// either reserved to be redeemed by KPI token holders when full finalization is
    /// reached (i.e. when all the oracles have reported their final result), or sent
    /// back to the KPI token owner (for example when KPIs have not been
    /// met, minus any present minimum payout). The possible scenarios are the following:
    ///
    /// If a goal percentage is either invalid or 0:
    /// - If an "all or none" approach has been chosen at the KPI token initialization
    /// time, all the collateral is sent back to the KPI token owner and the KPI token
    /// expires worthless on the spot.
    /// - If no "all or none" condition has been set, the KPI contracts calculates how
    /// much of the collaterals the specific oracle "governed" (through the weighting
    /// mechanism), subtracts any minimum payout for these and sends back the right amount
    /// of collateral to the KPI token owner.
    ///
    /// If a result is in a 0-100% exclusive range (and NOT above the higher bound) set for
    /// the KPI, the same calculations happen and some of the collateral gets sent back
    /// to the KPI token owner depending on how far we were from reaching the full KPI
    /// progress.
    ///
    /// If a percentage is at or above 100% completion, pretty much nothing happens to the
    /// collateral, which is fully assigned to the KPI token holders and which will become
    /// redeemable once the finalization process has ended for all the oracles assigned to
    /// the KPI token.
    ///
    /// Once all the oracles associated with the KPI token have reported their end result and
    /// finalize, the remaining collateral, if any, becomes redeemable by KPI token holders.
    /// @param _result The finalizing oracle's end result.
    function finalize(uint256 _result) external override nonReentrant {
        FinalizableOracleWithoutAddress storage _oracle = finalizableOracle(msg.sender);
        if (_isFinalized() || _isExpired()) {
            _oracle.finalized = true;
            return;
        }

        if (_result == 0 || _result == INVALID_ANSWER) {
            bool _allOrNone = allOrNone;
            handleLowOrInvalidResult(_oracle, _allOrNone);
            if (_allOrNone) {
                toBeFinalized = 0;
                _oracle.finalized = true;
                registerPostFinalizationCollateralAmounts();
                return;
            }
        } else {
            handleIntermediateOrOverHigherBoundResult(_oracle, _result);
        }

        _oracle.finalResult = _result;
        _oracle.finalized = true;
        unchecked {
            --toBeFinalized;
        }

        if (_isFinalized()) {
            registerPostFinalizationCollateralAmounts();
            emit Finalize();
        }
    }

    /// @dev Handles collateral state changes in case an oracle reported a low or invalid
    /// answer. In particular:
    /// - If an "all or none" approach has been chosen at the KPI token initialization
    /// level, all the collateral minus any minimum payout is marked to be recovered
    /// by the KPI token owner. From the KPI token holder's point of view, the token
    /// expires worthless on the spot.
    /// - If no "all or none" condition has been set, the KPI contract calculates how
    /// much of the collaterals the specific condition "governed" (through the weighting
    /// mechanism), subtracts any minimum payout for these and sends back the right amount
    /// of collateral to the KPI token owner.
    /// @param _oracle The oracle being finalized.
    /// @param _allOrNone Whether all the oracles are in an "all or none" configuration or not.
    function handleLowOrInvalidResult(FinalizableOracleWithoutAddress storage _oracle, bool _allOrNone) internal {
        for (uint256 _i = 0; _i < collateralsAmount; _i++) {
            CollateralWithoutToken storage _collateral = collateral[collateralAddressByIndex[_i]];
            uint256 _reimbursement;
            if (_allOrNone) {
                unchecked {
                    _reimbursement = _collateral.amount - _collateral.minimumPayout;
                }
            } else {
                uint256 _numerator = ((_collateral.amount - _collateral.minimumPayout) * _oracle.weight) << MULTIPLIER;
                _reimbursement = (_numerator / totalWeight) >> MULTIPLIER;
            }
            unchecked {
                _collateral.amount -= _reimbursement;
            }
        }
    }

    /// @dev Handles collateral state changes in case an oracle reported an intermediate answer.
    /// In particular if a result is in the specified range (and NOT above the higher bound) set
    /// for the KPI, the same calculations happen and some of the collateral gets sent back
    /// to the KPI token owner depending on how far we were from reaching the full KPI
    /// progress.
    ///
    /// If a result is at or above the higher bound set for the KPI token, pretty much
    /// nothing happens to the collateral, which is fully assigned to the KPI token holders
    /// and which will become redeemable once the finalization process has ended for all
    /// the oracles assigned to the KPI token.
    ///
    /// Once all the oracles associated with the KPI token have reported their end result and
    /// finalize, the remaining collateral, if any, becomes redeemable by KPI token holders.
    /// @param _oracle The oracle being finalized.
    /// @param _result The result the oracle is reporting.
    function handleIntermediateOrOverHigherBoundResult(FinalizableOracleWithoutAddress storage _oracle, uint256 _result)
        internal
    {
        if (_result < UNIT) {
            for (uint256 _i = 0; _i < collateralsAmount; _i++) {
                CollateralWithoutToken storage _collateral = collateral[collateralAddressByIndex[_i]];
                uint256 _numerator =
                    ((_collateral.amount - _collateral.minimumPayout) * _oracle.weight * (UNIT - _result)) << MULTIPLIER;
                uint256 _denominator = UNIT * totalWeight;
                uint256 _reimbursement = (_numerator / _denominator) >> MULTIPLIER;
                unchecked {
                    _collateral.amount -= _reimbursement;
                }
            }
        }
    }

    /// @dev After the KPI token has successfully been finalized, this function snapshots
    /// the collaterals state before any redemptions happens. This is used to be able
    /// to handle the separate burn/redeem feature, increasing the overall security of the
    /// solution (a subset of malicious/unresponsive tokens will not be enough to lock
    /// the whole campaign).
    function registerPostFinalizationCollateralAmounts() internal {
        for (uint8 _i = 0; _i < collateralsAmount; _i++) {
            CollateralWithoutToken storage _collateral = collateral[collateralAddressByIndex[_i]];
            _collateral.postFinalizationAmount = _collateral.amount;
        }
    }

    /// @dev Callable by the KPI token owner, this function lets them recover any ERC20
    /// token sent to the KPI token contract. An arbitrary receiver address can be specified
    /// so that the function can be used to also help users that did something wrong by
    /// mistake by sending ERC20 tokens here. Two scenarios are possible:
    /// - The KPI token owner wants to recover unused collateral that has been unlocked
    ///   by the KPI token after one or more oracle finalizations.
    /// - The KPI token owner wants to recover an arbitrary ERC20 token sent by mistake
    ///   to the KPI token contract (even the ERC20 KPI token itself can be recovered from
    ///   the contract).
    /// @param _token The ERC20 token address to be rescued.
    /// @param _receiver The address to which the recovered ERC20 tokens (if any) will be sent.
    function recoverERC20(address _token, address _receiver) external override {
        if (_receiver == address(0)) revert ZeroAddressReceiver();
        if (msg.sender != owner) revert Forbidden();
        bool _expired = _isExpired();
        CollateralWithoutToken storage _collateral = collateral[_token];
        if (_collateral.amount > 0) {
            uint256 _balance = IERC20(_token).balanceOf(address(this));
            uint256 _unneededBalance = _balance;
            if (_expired) {
                _collateral.amount = _collateral.minimumPayout;
            }
            unchecked {
                _unneededBalance -= _collateral.amount;
            }
            if (_unneededBalance == 0) revert NothingToRecover();
            IERC20(_token).safeTransfer(_receiver, _unneededBalance);
            emit RecoverERC20(_token, _unneededBalance, _receiver);
            return;
        }
        uint256 _reimbursement = IERC20(_token).balanceOf(address(this));
        if (_reimbursement == 0) revert NothingToRecover();
        IERC20(_token).safeTransfer(_receiver, _reimbursement);
        emit RecoverERC20(_token, _reimbursement, _receiver);
    }

    /// @dev Only callable by KPI token holders, this function lets them redeem
    /// any collateral left in the contract after finalization, proportional to
    /// their share of the total KPI token supply and left collateral amount.
    /// If the KPI token has expired worthless, this simply burns the user's KPI tokens.
    /// @param _data ABI-encoded data specifying the redeem parameters. In this
    /// specific case the ABI encoded parameter is an address that will receive
    /// the redeemed collaterals (if any).
    function redeem(bytes calldata _data) external override {
        address _receiver = abi.decode(_data, (address));
        if (_receiver == address(0)) revert ZeroAddressReceiver();
        if (!_isFinalized() && block.timestamp < expiration) revert Forbidden();
        uint256 _kpiTokenBalance = balanceOf(msg.sender);
        if (_kpiTokenBalance == 0) revert Forbidden();
        _burn(msg.sender, _kpiTokenBalance);
        bool _expired = _isExpired();
        uint256 _initialSupply = initialSupply;
        for (uint8 _i = 0; _i < collateralsAmount; _i++) {
            address _collateralAddress = collateralAddressByIndex[_i];
            CollateralWithoutToken storage _collateral = collateral[_collateralAddress];
            uint256 _redeemableAmount = 0;
            unchecked {
                _redeemableAmount = (
                    (_expired ? _collateral.minimumPayout : _collateral.postFinalizationAmount) * _kpiTokenBalance
                ) / _initialSupply;
                _collateral.amount -= _redeemableAmount;
            }
            IERC20(_collateralAddress).safeTransfer(_receiver, _redeemableAmount);
        }
        emit Redeem(msg.sender, _kpiTokenBalance);
    }

    /// @dev Only callable by KPI token holders, lets them register their redemption
    /// by burning the KPI tokens they have. Using this function, any collateral gained
    /// by the KPI token resolution must be explicitly requested by the user through
    /// the `redeemCollateral` function.
    function registerRedemption() external override {
        if (!_isFinalized() && block.timestamp < expiration) revert Forbidden();
        uint256 _kpiTokenBalance = balanceOf(msg.sender);
        if (_kpiTokenBalance == 0) revert Forbidden();
        _burn(msg.sender, _kpiTokenBalance);
        registeredBurn[msg.sender] += _kpiTokenBalance;
        emit RegisterRedemption(msg.sender, _kpiTokenBalance);
    }

    /// @dev Only callable by KPI token holders that have previously explicitly burned their
    /// KPI tokens through the `registerRedemption` function, this redeems the collateral
    /// token specified as input in the function. The function reverts if either an invalid
    /// collateral is specified or if zero of the given collateral can be redeemed.
    function redeemCollateral(address _token, address _receiver) external override {
        if (_token == address(0)) revert ZeroAddressToken();
        if (_receiver == address(0)) revert ZeroAddressReceiver();
        if (!_isFinalized() && block.timestamp < expiration) revert Forbidden();
        uint256 _burned = registeredBurn[msg.sender];
        if (_burned == 0) revert Forbidden();
        CollateralWithoutToken storage _collateral = collateral[_token];
        if (_collateral.amount == 0) revert NothingToRedeem();
        uint256 _redeemableAmount;
        unchecked {
            _redeemableAmount = (
                (_isExpired() ? _collateral.minimumPayout : _collateral.postFinalizationAmount) * _burned
            ) / initialSupply - _collateral.redeemedBy[msg.sender];
            if (_redeemableAmount == 0) revert NothingToRedeem();
            _collateral.amount -= _redeemableAmount;
        }
        if (_redeemableAmount == 0) revert Forbidden();
        _collateral.redeemedBy[msg.sender] += _redeemableAmount;
        IERC20(_token).safeTransfer(_receiver, _redeemableAmount);
        emit RedeemCollateral(msg.sender, _receiver, _token, _redeemableAmount);
    }

    /// @dev View function to check if the KPI token is finalized.
    /// @return A bool describing whether the token is finalized or not.
    function _isFinalized() internal view returns (bool) {
        return toBeFinalized == 0;
    }

    /// @dev View function to check if the KPI token is finalized.
    /// @return A bool describing whether the token is finalized or not.
    function finalized() external view override returns (bool) {
        return _isFinalized();
    }

    /// @dev View function to check if the KPI token is expired. A KPI token is
    /// considered expired when not finalized before the expiration date comes.
    /// @return A bool describing whether the token is finalized or not.
    function _isExpired() internal view returns (bool) {
        return !_isFinalized() && expiration <= block.timestamp;
    }

    /// @dev View function to check if the KPI token is initialized.
    /// @return A bool describing whether the token is initialized or not.
    function _isInitialized() internal view returns (bool) {
        return owner != address(0);
    }

    /// @dev View function to query all the oracles associated with the KPI token at once.
    /// @return The oracles array.
    function oracles() external view override returns (address[] memory) {
        if (!_isInitialized()) revert NotInitialized();
        address[] memory _oracleAddresses = new address[](oraclesAmount);
        for (uint256 _i = 0; _i < _oracleAddresses.length; _i++) {
            _oracleAddresses[_i] = finalizableOracleAddressByIndex[_i];
        }
        return _oracleAddresses;
    }

    /// @dev View function returning all the most important data about the KPI token, in
    /// an ABI-encoded structure. The structure includes collaterals, finalizable oracles,
    /// "all-or-none" flag, initial supply of the ERC20 KPI token, along with name and symbol.
    /// @return The ABI-encoded data.
    function data() external view returns (bytes memory) {
        FinalizableOracle[] memory _finalizableOracles = new FinalizableOracle[](oraclesAmount);
        for (uint256 _i = 0; _i < _finalizableOracles.length; _i++) {
            address _addrezz = finalizableOracleAddressByIndex[_i];
            FinalizableOracleWithoutAddress memory _finalizableOracle = finalizableOracleByAddress[_addrezz];
            _finalizableOracles[_i] = FinalizableOracle({
                addrezz: _addrezz,
                weight: _finalizableOracle.weight,
                finalResult: _finalizableOracle.finalResult,
                finalized: _finalizableOracle.finalized
            });
        }
        Collateral[] memory _collaterals = new Collateral[](collateralsAmount);
        for (uint256 _i = 0; _i < _collaterals.length; _i++) {
            address _collateralAddress = collateralAddressByIndex[_i];
            CollateralWithoutToken storage _collateral = collateral[_collateralAddress];
            _collaterals[_i] = Collateral({
                token: _collateralAddress,
                amount: _collateral.amount,
                minimumPayout: _collateral.minimumPayout
            });
        }
        return abi.encode(_collaterals, _finalizableOracles, allOrNone, initialSupply);
    }

    /// @dev View function returning info about the template used to instantiate this KPI token.
    /// @return The template struct.
    function template() external view override returns (Template memory) {
        return IBaseTemplatesManager(kpiTokensManager).template(kpiTokenTemplateId, kpiTokenTemplateVersion);
    }
}
