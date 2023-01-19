import {
    Button,
    NumberInput,
    Select,
    SelectOption,
    TextMono,
} from "@carrot-kpi/ui";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { utils } from "ethers";
import { CollateralData, NumberFormatValue } from "../../types";
import { Amount, Token } from "@carrot-kpi/sdk";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";

// TODO: where should we get this data?
const DEV_COLLATERAL_TOKENS = [
    new Token(
        CCT_CHAIN_ID,
        CCT_ERC20_1_ADDRESS,
        18,
        "TST_1",
        "Collateral test token 1"
    ),
    new Token(
        CCT_CHAIN_ID,
        CCT_ERC20_2_ADDRESS,
        18,
        "TST_2",
        "Collateral test token 2"
    ),
];

interface TokenOption extends SelectOption {
    name: string;
    decimals: string;
}

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

    const [collaterals, setCollaterals] = useState(collateralsData);
    const [disabled, setDisabled] = useState(true);

    // picker state
    const pickerTokenOptions: TokenOption[] = useMemo(() => {
        return __DEV__
            ? DEV_COLLATERAL_TOKENS.map((token) => {
                  return {
                      label: token.symbol,
                      value: token.address,
                      name: token.name,
                      decimals: token.decimals.toString(),
                  };
              })
            : [];
    }, []);
    const [addDisabled, setAddDisabled] = useState(true);
    const [pickerTokenOption, setPickerTokenOption] =
        useState<TokenOption | null>(null);
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
        address: !!pickerTokenOption ? address : undefined,
        token: !!pickerTokenOption
            ? (pickerTokenOption.value as Address)
            : undefined,
    });

    useEffect(() => {
        setDisabled(collaterals.length === 0);
    }, [collaterals]);

    useEffect(() => {
        if (
            !pickerTokenOption ||
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
                    (pickerTokenOption.value as string).toLowerCase()
            )
        );
    }, [
        collaterals,
        pickerRawAmount.value,
        pickerRawMinimumPayout.value,
        pickerTokenOption,
    ]);

    const handleCollateralAdd = useCallback((): void => {
        if (!chain || !pickerTokenOption) return;
        const token = new Token(
            chain.id,
            pickerTokenOption.value as string,
            parseInt(pickerTokenOption.decimals),
            pickerTokenOption.label,
            pickerTokenOption.name
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
        setPickerTokenOption(null);
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
        pickerTokenOption,
    ]);

    const handleNext = useCallback((): void => {
        onNext(collaterals);
    }, [collaterals, onNext]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <div className="rounded-xxl border border-black p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <Select
                                    id="collateral-select"
                                    label=""
                                    placeholder={t(
                                        "label.collateral.picker.token.pick"
                                    )}
                                    options={pickerTokenOptions}
                                    value={pickerTokenOption}
                                    onChange={setPickerTokenOption}
                                />
                                <NumberInput
                                    id="collateral-amount"
                                    label=""
                                    placeholder="0.0"
                                    className="border-none text-right"
                                    size="xl"
                                    disabled={!!!pickerTokenOption}
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
                                    className="border-none text-right"
                                    size="xl"
                                    disabled={!!!pickerTokenOption}
                                    value={
                                        pickerRawMinimumPayout.formattedValue
                                    }
                                    onValueChange={setPickerRawMinimumPayout}
                                />
                            </div>
                            <div className="flex justify-end">
                                <TextMono size="sm">$ 7,068.31</TextMono>
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    size="small"
                    onClick={handleCollateralAdd}
                    disabled={addDisabled}
                >
                    {t("label.collateral.picker.apply")}
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3">
                    <TextMono className="font-medium" size="sm">
                        {t("label.collateral.table.collateral")}
                    </TextMono>
                    <TextMono className="text-center font-medium" size="sm">
                        {t("label.collateral.table.amount")}
                    </TextMono>
                    <TextMono className="text-right font-medium" size="sm">
                        {t("label.collateral.table.minimum.payout")}
                    </TextMono>
                </div>
                <div className="scrollbar rounded-xxl flex max-h-48 flex-col gap-2 overflow-y-auto border border-black p-4">
                    {collaterals.length === 0 ? (
                        <TextMono
                            size="sm"
                            className="text-center"
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
                                    <TextMono className="text-" size="md">
                                        {token.symbol}
                                    </TextMono>
                                    <TextMono className="text-center" size="md">
                                        {utils.commify(
                                            collateral.amount.toFixed(4)
                                        )}
                                    </TextMono>
                                    <TextMono className="text-right" size="md">
                                        {utils.commify(
                                            collateral.minimumPayout.toFixed(4)
                                        )}
                                    </TextMono>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <Button size="small" onClick={handleNext} disabled={disabled}>
                {t("next")}
            </Button>
        </div>
    );
};
