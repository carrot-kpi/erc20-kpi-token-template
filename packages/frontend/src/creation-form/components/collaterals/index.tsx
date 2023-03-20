import {
    Button,
    ERC20TokenPicker,
    NumberInput,
    TextInput,
    Typography,
    TokenInfoWithBalance,
    TokenListWithBalance,
    NextStepButton,
    Skeleton,
} from "@carrot-kpi/ui";
import { NamespacedTranslateFunction, useTokenLists } from "@carrot-kpi/react";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { utils } from "ethers";
import {
    CollateralData,
    NumberFormatValue,
    TokenWithLogoURI,
} from "../../types";
import { Amount, Token } from "@carrot-kpi/sdk";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";
import { PROTOCOL_FEE_BPS, TOKEN_LIST_URLS } from "../../constants";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";
import { CollateralsTable } from "./table";
import { formatTokenAmount } from "../../../utils/formatting";
import { parseUnits } from "ethers/lib/utils.js";

interface CollateralProps {
    t: NamespacedTranslateFunction;
    collaterals: CollateralData[];
    onNext: (collaterals: CollateralData[]) => void;
}

export const Collaterals = ({
    t,
    collaterals: collateralsData,
    onNext,
}: CollateralProps): ReactElement => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { lists: tokenLists, loading } = useTokenLists(TOKEN_LIST_URLS);

    const [collaterals, setCollaterals] = useState(collateralsData);
    const [selectedTokenList, setSelectedTokenList] = useState<
        TokenListWithBalance | undefined
    >();
    const [disabled, setDisabled] = useState(true);

    // picker state
    const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
    const [addDisabled, setAddDisabled] = useState(true);
    const [pickedToken, setPickedToken] = useState<TokenInfoWithBalance | null>(
        null
    );
    const [pickerRawAmount, setPickerRawAmount] = useState<NumberFormatValue>({
        formattedValue: "",
        value: "",
    });
    const [protocolFeeAmount, setProtocolFeeAmount] = useState("");
    const [pickerRawMinimumPayout, setPickerRawMinimumPayout] =
        useState<NumberFormatValue>({
            formattedValue: "",
            value: "",
        });

    // fetch picked erc20 token balance
    const { data, isLoading } = useBalance({
        address: !!pickedToken ? address : undefined,
        token: !!pickedToken ? (pickedToken.address as Address) : undefined,
    });

    useEffect(() => {
        setDisabled(collaterals.length === 0);
    }, [collaterals]);

    useEffect(() => {
        if (!!selectedTokenList || tokenLists.length === 0) return;
        const defaultSelectedList = tokenLists[0];
        if (__DEV__) {
            defaultSelectedList.tokens.push({
                chainId: CCT_CHAIN_ID,
                address: CCT_ERC20_1_ADDRESS,
                name: "Collateral test token 1",
                decimals: 18,
                symbol: "TST1",
            });
            defaultSelectedList.tokens.push({
                chainId: CCT_CHAIN_ID,
                address: CCT_ERC20_2_ADDRESS,
                name: "Collateral test token 2",
                decimals: 18,
                symbol: "TST2",
            });
        }
        setSelectedTokenList(defaultSelectedList as TokenListWithBalance);
    }, [selectedTokenList, tokenLists]);

    useEffect(() => {
        if (
            !pickedToken ||
            !pickerRawAmount.value ||
            !pickerRawMinimumPayout.value
        ) {
            setAddDisabled(true);
            return;
        }
        const parsedAmount = parseFloat(pickerRawAmount.value);
        if (data) {
            // check if the user has enough balance of the picked token
            const bnPickerAmount = utils.parseUnits(
                pickerRawAmount.value,
                pickedToken.decimals
            );
            if (data.value.lt(bnPickerAmount)) {
                setAddDisabled(true);
                return;
            }
        }
        const amountMinusFees =
            parsedAmount - (parsedAmount * PROTOCOL_FEE_BPS) / 10_000;
        const parsedMinimumAmount = parseFloat(pickerRawMinimumPayout.value);
        if (amountMinusFees === 0 || parsedMinimumAmount >= amountMinusFees) {
            setAddDisabled(true);
            return;
        }
        setAddDisabled(
            !!collaterals.find(
                (collateral) =>
                    collateral.amount.currency.address.toLowerCase() ===
                    pickedToken.address.toLowerCase()
            )
        );
    }, [
        collaterals,
        pickerRawAmount.value,
        pickerRawMinimumPayout.value,
        pickedToken,
        data,
    ]);

    useEffect(() => {
        if (!pickedToken || !pickerRawAmount.value) return;
        const parsedRawAmount = parseFloat(pickerRawAmount.value);
        if (isNaN(parsedRawAmount)) return;
        setProtocolFeeAmount(
            formatTokenAmount(
                new Amount(
                    pickedToken as unknown as Token,
                    parseUnits(
                        ((parsedRawAmount * PROTOCOL_FEE_BPS) / 10_000).toFixed(
                            pickedToken.decimals
                        ),
                        pickedToken.decimals
                    )
                )
            )
        );
    }, [pickedToken, pickerRawAmount]);

    const handleOpenERC20TokenPicker = useCallback((): void => {
        setTokenPickerOpen(true);
    }, []);

    const handleERC20TokenPickerDismiss = useCallback((): void => {
        setTokenPickerOpen(false);
    }, []);

    const handleCollateralAdd = useCallback((): void => {
        if (!chain || !pickedToken) return;
        const token = new TokenWithLogoURI(
            chain.id,
            pickedToken.address,
            pickedToken.decimals,
            pickedToken.symbol,
            pickedToken.name,
            pickedToken.logoURI
        );
        setCollaterals([
            ...collaterals,
            {
                amount: new Amount(
                    token,
                    utils.parseUnits(pickerRawAmount.value, token.decimals)
                ),
                minimumPayout: new Amount(
                    token,
                    utils.parseUnits(
                        pickerRawMinimumPayout.value,
                        token.decimals
                    )
                ),
            },
        ]);
        setPickedToken(null);
        setPickerRawAmount({
            formattedValue: "",
            value: "",
        });
        setPickerRawMinimumPayout({
            formattedValue: "",
            value: "",
        });
    }, [
        chain,
        collaterals,
        pickerRawAmount.value,
        pickerRawMinimumPayout.value,
        pickedToken,
    ]);

    const handleNext = useCallback((): void => {
        onNext(collaterals);
    }, [collaterals, onNext]);

    const handleRemoveCollateral = useCallback(
        (index: number) => {
            setCollaterals(collaterals.filter((_, i) => i !== index));
        },
        [collaterals]
    );

    const handleMaxClick = useCallback(() => {
        if (!data || !pickedToken) return;
        setPickerRawAmount({
            formattedValue: data.formatted,
            value: utils.formatUnits(
                data.value.toString(),
                pickedToken.decimals
            ),
        });
    }, [data, pickedToken]);

    return (
        <>
            <ERC20TokenPicker
                open={tokenPickerOpen}
                onDismiss={handleERC20TokenPickerDismiss}
                selectedToken={pickedToken}
                onSelectedTokenChange={setPickedToken}
                lists={tokenLists as TokenListWithBalance[]}
                loading={loading}
                selectedList={selectedTokenList}
                onSelectedListChange={setSelectedTokenList}
                chainId={chain?.id}
                withBalances
                accountAddress={address}
                messages={{
                    search: {
                        title: t("erc20.picker.search.title"),
                        inputPlaceholder: t("erc20.picker.search.placeholder"),
                        noTokens: t("erc20.picker.search.no.token"),
                        manageLists: t("erc20.picker.search.manage.lists"),
                    },
                    manageLists: {
                        title: t("erc20.picker.manage.lists.title"),
                        noLists: t("erc20.picker.manage.lists.no.lists"),
                    },
                }}
            />
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <div className="rounded-xxl border border-black p-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <div
                                        onClick={handleOpenERC20TokenPicker}
                                        className="cursor-pointer"
                                    >
                                        <TextInput
                                            label=""
                                            autoComplete="off"
                                            placeholder={t(
                                                "label.collateral.picker.token.pick"
                                            )}
                                            className={{
                                                input: "w-full cursor-pointer",
                                            }}
                                            readOnly
                                            value={pickedToken?.symbol || ""}
                                        />
                                    </div>
                                    <NumberInput
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "w-full border-none text-right",
                                        }}
                                        variant="xl"
                                        allowNegative={false}
                                        disabled={!!!pickedToken}
                                        value={pickerRawAmount.formattedValue}
                                        onValueChange={setPickerRawAmount}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="sm">
                                            {t("label.collateral.balance")}:{" "}
                                        </Typography>
                                        {isLoading ? (
                                            <Skeleton variant="sm" />
                                        ) : !!data ? (
                                            <>
                                                <Typography variant="sm">
                                                    {data.formatted}
                                                </Typography>
                                                <Typography
                                                    variant="sm"
                                                    className={{
                                                        root: "text-orange cursor-pointer",
                                                    }}
                                                    uppercase
                                                    onClick={handleMaxClick}
                                                >
                                                    {t(
                                                        "label.collateral.picker.balance.max"
                                                    )}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="sm">
                                                -
                                            </Typography>
                                        )}
                                    </div>
                                    {/* <Typography size="sm">$ 7,068.31</Typography> */}
                                </div>

                                <div className="h-px w-full bg-black" />

                                <div className="flex items-center justify-between">
                                    <Typography>
                                        {t(
                                            "label.collateral.picker.minimum.payout"
                                        )}
                                    </Typography>
                                    <NumberInput
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "border-none text-right w-full",
                                        }}
                                        variant="xl"
                                        disabled={!!!pickedToken}
                                        allowNegative={false}
                                        value={
                                            pickerRawMinimumPayout.formattedValue
                                        }
                                        onValueChange={
                                            setPickerRawMinimumPayout
                                        }
                                    />
                                </div>

                                <div className="h-px w-full bg-black" />

                                <div className="flex items-center justify-between">
                                    <Typography>
                                        {t("label.collateral.picker.fee")}
                                    </Typography>
                                    <Typography>
                                        {PROTOCOL_FEE_BPS / 100}%{" "}
                                        {protocolFeeAmount &&
                                            pickedToken &&
                                            `(${protocolFeeAmount} ${pickedToken.symbol})`}
                                    </Typography>
                                </div>
                                {/* TODO: implement price fetching */}
                                {/* <div className="flex justify-end">
                                <Typography size="sm">$ 7,068.31</Typography>
                            </div> */}
                            </div>
                        </div>
                    </div>
                    <Button
                        size="small"
                        icon={ArrowDown}
                        onClick={handleCollateralAdd}
                        disabled={addDisabled}
                    >
                        {t("label.collateral.picker.apply")}
                    </Button>
                </div>
                <CollateralsTable
                    t={t}
                    collaterals={collaterals}
                    onRemove={handleRemoveCollateral}
                />
            </div>
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </>
    );
};
