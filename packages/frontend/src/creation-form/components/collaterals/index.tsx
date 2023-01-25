import {
    Button,
    ERC20TokenPicker,
    NumberInput,
    TextInput,
    TextMono,
    TokenListWithBalance,
    TokenInfoWithBalance,
} from "@carrot-kpi/ui";
import { NamespacedTranslateFunction, useTokenLists } from "@carrot-kpi/react";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { utils } from "ethers";
import { CollateralData, NumberFormatValue } from "../../types";
import { Amount, Token } from "@carrot-kpi/sdk";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";
import { NextButton } from "../next-button";
import { PreviousButton } from "../previous-button";
import { TOKEN_LIST_URLS } from "../../constants";

interface CollateralProps {
    t: NamespacedTranslateFunction;
    collaterals: CollateralData[];
    onPrevious: () => void;
    onNext: (collaterals: CollateralData[]) => void;
}

export const Collaterals = ({
    t,
    collaterals: collateralsData,
    onPrevious,
    onNext,
}: CollateralProps): ReactElement => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    // TODO: handle loading state
    const { lists: tokenLists } = useTokenLists(TOKEN_LIST_URLS);

    const [collaterals, setCollaterals] = useState(collateralsData);
    const [selectedTokenList, setSelectedTokenList] = useState<
        TokenListWithBalance | undefined
    >();
    const [disabled, setDisabled] = useState(true);

    // picker state
    const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
    const [addDisabled, setAddDisabled] = useState(true);
    const [pickerToken, setPickerToken] = useState<TokenInfoWithBalance | null>(
        null
    );
    const [pickerRawAmount, setPickerRawAmount] = useState<NumberFormatValue>({
        formattedValue: "",
        value: "",
    });
    const [pickerRawMinimumPayout, setPickerRawMinimumPayout] =
        useState<NumberFormatValue>({
            formattedValue: "",
            value: "",
        });

    // fetch picked erc20 token balance
    const { data, isLoading } = useBalance({
        address: !!pickerToken ? address : undefined,
        token: !!pickerToken ? (pickerToken.address as Address) : undefined,
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
        setSelectedTokenList(defaultSelectedList);
    }, [selectedTokenList, tokenLists]);

    useEffect(() => {
        if (
            !pickerToken ||
            !pickerRawAmount.value ||
            !pickerRawMinimumPayout.value
        ) {
            setAddDisabled(true);
            return;
        }
        const parsedAmount = parseFloat(pickerRawAmount.value);
        const parsedMinimumAmount = parseFloat(pickerRawMinimumPayout.value);
        if (
            parsedAmount === 0 ||
            parsedMinimumAmount === 0 ||
            parsedMinimumAmount >= parsedAmount
        ) {
            setAddDisabled(true);
            return;
        }
        setAddDisabled(
            !!collaterals.find(
                (collateral) =>
                    collateral.amount.currency.address.toLowerCase() ===
                    pickerToken.address.toLowerCase()
            )
        );
    }, [
        collaterals,
        pickerRawAmount.value,
        pickerRawMinimumPayout.value,
        pickerToken,
    ]);

    const handleOpenERC20TokenPicker = useCallback((): void => {
        setTokenPickerOpen(true);
    }, []);

    const handleERC20TokenPickerDismiss = useCallback((): void => {
        setTokenPickerOpen(false);
    }, []);

    const handleCollateralAdd = useCallback((): void => {
        if (!chain || !pickerToken) return;
        const token = new Token(
            chain.id,
            pickerToken.address,
            pickerToken.decimals,
            pickerToken.symbol,
            pickerToken.name
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
        setPickerToken(null);
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
        pickerToken,
    ]);

    const handleNext = useCallback((): void => {
        onNext(collaterals);
    }, [collaterals, onNext]);

    console.log(tokenLists);

    return (
        <>
            <ERC20TokenPicker
                open={tokenPickerOpen}
                onDismiss={handleERC20TokenPickerDismiss}
                selectedToken={pickerToken}
                onSelectedTokenChange={setPickerToken}
                lists={tokenLists}
                /* TODO: define */
                selectedList={selectedTokenList}
                onSelectedListChange={setSelectedTokenList}
                chainId={chain?.id}
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
                                            id="collateral-select"
                                            label=""
                                            placeholder={t(
                                                "label.collateral.picker.token.pick"
                                            )}
                                            className={{
                                                root: "cursor-pointer",
                                            }}
                                            value={pickerToken?.symbol || ""}
                                        />
                                    </div>
                                    <NumberInput
                                        id="collateral-amount"
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "border-none text-right",
                                        }}
                                        size="xl"
                                        disabled={!!!pickerToken}
                                        value={pickerRawAmount.formattedValue}
                                        onValueChange={setPickerRawAmount}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <div className="flex items-center gap-2">
                                        <TextMono size="sm">
                                            {t("label.collateral.balance")}:{" "}
                                        </TextMono>
                                        {isLoading ? (
                                            <span className="inline-block h-4 w-14 animate-pulse rounded-md bg-gray-200 text-sm" />
                                        ) : !!data ? (
                                            <TextMono size="sm">
                                                {data.formatted}
                                            </TextMono>
                                        ) : (
                                            <TextMono size="sm">-</TextMono>
                                        )}
                                    </div>
                                    {/* <TextMono size="sm">$ 7,068.31</TextMono> */}
                                </div>

                                <div className="h-px w-full bg-black" />

                                <div className="flex items-center justify-between">
                                    <TextMono size="md">
                                        {t(
                                            "label.collateral.picker.minimum.payout"
                                        )}
                                    </TextMono>
                                    <NumberInput
                                        id="minimum-payout"
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "border-none text-right",
                                        }}
                                        size="xl"
                                        disabled={!!!pickerToken}
                                        value={
                                            pickerRawMinimumPayout.formattedValue
                                        }
                                        onValueChange={
                                            setPickerRawMinimumPayout
                                        }
                                    />
                                </div>
                                {/* TODO: implement price fetching */}
                                {/* <div className="flex justify-end">
                                <TextMono size="sm">$ 7,068.31</TextMono>
                            </div> */}
                            </div>
                        </div>
                    </div>
                    <Button
                        size="small"
                        onClick={handleCollateralAdd}
                        disabled={addDisabled}
                        className={{ root: "cui-w-full" }}
                    >
                        {t("label.collateral.picker.apply")}
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-3">
                        <TextMono weight="medium" size="sm">
                            {t("label.collateral.table.collateral")}
                        </TextMono>
                        <TextMono
                            weight="medium"
                            className={{ root: "text-center" }}
                            size="sm"
                        >
                            {t("label.collateral.table.amount")}
                        </TextMono>
                        <TextMono
                            weight="medium"
                            className={{ root: "text-right" }}
                            size="sm"
                        >
                            {t("label.collateral.table.minimum.payout")}
                        </TextMono>
                    </div>
                    <div className="scrollbar rounded-xxl flex max-h-48 flex-col gap-2 overflow-y-auto border border-black p-4">
                        {collaterals.length === 0 ? (
                            <TextMono
                                size="sm"
                                className={{ root: "text-center" }}
                                weight="medium"
                            >
                                {t("label.collateral.table.empty")}
                            </TextMono>
                        ) : (
                            collaterals.map((collateral) => {
                                const token = collateral.amount.currency;
                                return (
                                    <div
                                        key={token.address}
                                        className="grid grid-cols-3"
                                    >
                                        <TextMono size="md">
                                            {token.symbol}
                                        </TextMono>
                                        <TextMono
                                            className={{ root: "text-center" }}
                                            size="md"
                                        >
                                            {utils.commify(
                                                collateral.amount.toFixed(4)
                                            )}
                                        </TextMono>
                                        <TextMono
                                            className={{ root: "text-right" }}
                                            size="md"
                                        >
                                            {utils.commify(
                                                collateral.minimumPayout.toFixed(
                                                    4
                                                )
                                            )}
                                        </TextMono>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="flex justify-between">
                    <PreviousButton t={t} onClick={onPrevious} />
                    <NextButton
                        t={t}
                        onClick={handleNext}
                        disabled={disabled}
                    />
                </div>
            </div>
        </>
    );
};
