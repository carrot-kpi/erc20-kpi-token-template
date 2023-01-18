import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Token } from "@carrot-kpi/sdk";
import {
    Button,
    TextMono,
    Select,
    SelectOption,
    NumberInput,
} from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Address, useBalance, useAccount } from "wagmi";
import { CollateralData, NumberFormatValue } from "../../creation-form/types";

interface CollateralOption extends SelectOption {
    decimals: number;
}

interface CollateralPickerProps {
    t: NamespacedTranslateFunction;
    tokens: Token[];
    onAdd: (collateral: CollateralData) => void;
}

// TODO: add token icons to Select and collateral list
export const CollateralPicker = ({
    t,
    tokens,
    onAdd,
}: CollateralPickerProps): ReactElement => {
    const { address } = useAccount();
    const collateralOptions: CollateralOption[] = useMemo(
        () =>
            tokens.map((token) => ({
                label: token.symbol,
                value: token.address,
                decimals: token.decimals,
            })),
        [tokens]
    );

    const [collateralActive, setCollateralActive] =
        useState<CollateralOption | null>(null);
    const [collateralAmount, setCollateralAmount] = useState<NumberFormatValue>(
        { floatValue: 0, formattedValue: "", value: "" }
    );
    const [minimumPayout, setMinimumPayout] = useState<NumberFormatValue>({
        floatValue: 0,
        formattedValue: "",
        value: "",
    });
    const [nextDisabled, setNextDisabled] = useState(true);

    const wagmiToken = useMemo(() => {
        return !!collateralActive
            ? (collateralActive.value as Address)
            : undefined;
    }, [collateralActive]);
    const wagmiAddress = useMemo(() => {
        return !!collateralActive ? address : undefined;
    }, [address, collateralActive]);
    const { data, isLoading } = useBalance({
        address: wagmiAddress,
        token: wagmiToken,
        enabled: !!collateralActive?.value,
    });

    useEffect(() => {
        setNextDisabled(
            !collateralActive ||
                !collateralAmount.floatValue ||
                (!!minimumPayout.floatValue &&
                    minimumPayout.floatValue >= collateralAmount.floatValue)
        );
    }, [
        collateralActive,
        collateralAmount.floatValue,
        minimumPayout.floatValue,
    ]);

    const handleOnConfirm = useCallback(() => {
        if (!collateralActive) return;
        onAdd({
            address: collateralActive.value as Address,
            decimals: collateralActive.decimals,
            symbol: collateralActive.label,
            amount: collateralAmount,
            minimumPayout: minimumPayout,
        });
    }, [collateralActive, collateralAmount, minimumPayout, onAdd]);

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-xxl border border-black p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <Select
                                id="collateral-select"
                                label=""
                                placeholder="Pick a token"
                                options={collateralOptions}
                                value={collateralActive}
                                onChange={setCollateralActive}
                            />
                            <NumberInput
                                id="collateral-amount"
                                label=""
                                placeholder="0.0"
                                className="border-none text-right"
                                size="xl"
                                disabled={!!!collateralActive}
                                value={collateralAmount.formattedValue}
                                onValueChange={setCollateralAmount}
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
                                {t("label.collateral.picker.minimum.payout")}
                            </TextMono>

                            <NumberInput
                                id="minimum-payout"
                                label=""
                                placeholder="0.0"
                                className="border-none text-right"
                                size="xl"
                                disabled={!!!collateralActive}
                                value={minimumPayout.formattedValue}
                                onValueChange={setMinimumPayout}
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
                onClick={handleOnConfirm}
                disabled={nextDisabled}
            >
                {t("label.collateral.picker.apply")}
            </Button>
        </div>
    );
};
