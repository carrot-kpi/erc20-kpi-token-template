import {
    Button,
    ERC20TokenPicker,
    NumberInput,
    TextInput,
    Typography,
    TokenInfoWithBalance,
    TokenListWithBalance,
    RemoteLogo,
} from "@carrot-kpi/ui";
import { NamespacedTranslateFunction, useTokenLists } from "@carrot-kpi/react";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { utils } from "ethers";
import {
    CollateralData,
    NumberFormatValue,
    TokenWithLogoURI,
} from "../../types";
import { Amount, IPFSService } from "@carrot-kpi/sdk";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";
import { NextButton } from "../next-button";
import { PreviousButton } from "../previous-button";
import { TOKEN_LIST_URLS } from "../../constants";
import { getDefaultERC20TokenLogoURL } from "../../../utils/erc20";
import { ReactComponent as X } from "../../../assets/x.svg";

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
    const [pickedToken, setPickedToken] = useState<TokenInfoWithBalance | null>(
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
                    pickedToken.address.toLowerCase()
            )
        );
    }, [
        collaterals,
        pickerRawAmount.value,
        pickerRawMinimumPayout.value,
        pickedToken,
    ]);

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
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (!event.target) return;
            const rawIndex = (event.target as HTMLDivElement).dataset.index;
            if (!rawIndex) return;
            const index = parseInt(rawIndex);
            if (isNaN(index)) return;
            setCollaterals(collaterals.filter((_, i) => i !== index));
        },
        [collaterals]
    );

    return (
        <>
            <ERC20TokenPicker
                open={tokenPickerOpen}
                onDismiss={handleERC20TokenPickerDismiss}
                selectedToken={pickedToken}
                onSelectedTokenChange={setPickedToken}
                lists={tokenLists as TokenListWithBalance[]}
                /* TODO: define */
                selectedList={selectedTokenList}
                onSelectedListChange={setSelectedTokenList}
                chainId={chain?.id}
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
                                            id="collateral-select"
                                            label=""
                                            autoComplete="off"
                                            placeholder={t(
                                                "label.collateral.picker.token.pick"
                                            )}
                                            className={{
                                                root: "cursor-pointer",
                                                input: "w-full",
                                            }}
                                            readOnly
                                            value={pickedToken?.symbol || ""}
                                        />
                                    </div>
                                    <NumberInput
                                        id="collateral-amount"
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "w-full border-none text-right",
                                        }}
                                        variant="xl"
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
                                            <span className="inline-block h-4 w-14 animate-pulse rounded-md bg-gray-200 text-sm" />
                                        ) : !!data ? (
                                            <Typography variant="sm">
                                                {data.formatted}
                                            </Typography>
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
                                        id="minimum-payout"
                                        label=""
                                        placeholder="0.0"
                                        className={{
                                            input: "border-none text-right w-full",
                                        }}
                                        variant="xl"
                                        disabled={!!!pickedToken}
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
                                <Typography size="sm">$ 7,068.31</Typography>
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
                        <Typography weight="medium" variant="sm">
                            {t("label.collateral.table.collateral")}
                        </Typography>
                        <Typography
                            weight="medium"
                            className={{ root: "text-center" }}
                            variant="sm"
                        >
                            {t("label.collateral.table.amount")}
                        </Typography>
                        <Typography
                            weight="medium"
                            className={{ root: "text-right" }}
                            variant="sm"
                        >
                            {t("label.collateral.table.minimum.payout")}
                        </Typography>
                    </div>
                    <div className="rounded-xxl flex max-h-48 flex-col gap-2 overflow-y-auto border border-black p-4">
                        {collaterals.length === 0 ? (
                            <Typography
                                variant="sm"
                                className={{ root: "text-center" }}
                                weight="medium"
                            >
                                {t("label.collateral.table.empty")}
                            </Typography>
                        ) : (
                            collaterals.map((collateral, index) => {
                                const token = collateral.amount.currency;
                                return (
                                    <div
                                        key={token.address}
                                        className="grid grid-cols-3"
                                    >
                                        <div className="flex gap-2 items-center">
                                            <div
                                                onClick={handleRemoveCollateral}
                                                data-index={index}
                                            >
                                                <X className="stroke-gray-500 dark:stroke-gray-700 cursor-pointer" />
                                            </div>
                                            <RemoteLogo
                                                src={token.logoURI}
                                                size="sm"
                                                defaultSrc={getDefaultERC20TokenLogoURL(
                                                    token.chainId,
                                                    token.address
                                                )}
                                                defaultText={token.symbol}
                                                ipfsGatewayURL={
                                                    IPFSService.gateway
                                                }
                                            />
                                            <Typography>
                                                {token.symbol}
                                            </Typography>
                                        </div>
                                        <Typography
                                            className={{ root: "text-center" }}
                                        >
                                            {utils.commify(
                                                collateral.amount.toFixed(4)
                                            )}
                                        </Typography>
                                        <Typography
                                            className={{ root: "text-right" }}
                                        >
                                            {utils.commify(
                                                collateral.minimumPayout.toFixed(
                                                    4
                                                )
                                            )}
                                        </Typography>
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
