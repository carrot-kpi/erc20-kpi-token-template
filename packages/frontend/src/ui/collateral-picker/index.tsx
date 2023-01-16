import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Token } from "@carrot-kpi/sdk";
import {
    Button,
    TextMono,
    Select,
    SelectOption,
    NumberInput,
} from "@carrot-kpi/ui";
import { BigNumber } from "ethers";
import { ChangeEvent, ReactElement, useMemo, useState } from "react";
import { Address } from "wagmi";
import { CollateralData } from "../../creation-form/types";

interface CollateralPickerProps {
    t: NamespacedTranslateFunction;
    tokens: Token[];
    onConfirm: ({ address, amount, minimumPayout }: CollateralData) => void;
}

// TODO: add token icons to Select and collateral list
export const CollateralPicker = ({
    t,
    tokens,
    onConfirm,
}: CollateralPickerProps): ReactElement => {
    const [collateralActive, setCollateralActive] =
        useState<SelectOption | null>(null);
    const [collateralAmount, setCollateralAmount] = useState<string>("");
    const [minimumPayout, setMinimumPayout] = useState<string>("");

    const handleCollateralChange = (option: SelectOption): void => {
        setCollateralActive(option);
    };

    const handleColletarlAmountChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setCollateralAmount(event.target.value);
    };

    const handleMinimumPayoutChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setMinimumPayout(event.target.value);
    };

    const handleOnConfirm = (): void => {
        onConfirm({
            address: collateralActive?.value as Address,
            amount: BigNumber.from(collateralAmount),
            minimumPayout: BigNumber.from(minimumPayout),
        });
    };

    const collateralOptions = useMemo(
        () =>
            tokens.map((token) => ({
                value: token.address,
                label: token.symbol,
            })),
        [tokens]
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-xxl border border-black p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                            <Select
                                id="collaterla-select"
                                label=""
                                placeholder="Pick a token"
                                options={collateralOptions}
                                value={collateralActive}
                                onChange={handleCollateralChange}
                            />
                            <NumberInput
                                id="collateral-amount"
                                label=""
                                placeholder="0.0"
                                className="text-right border-none"
                                size="xl"
                                value={collateralAmount}
                                onChange={handleColletarlAmountChange}
                            />
                        </div>

                        <div className="flex justify-between">
                            {/* TODO: where do we get this value? */}
                            <TextMono size="sm">
                                Balance: 743.343.57 MAX
                            </TextMono>
                            <TextMono size="sm">$ 7,068.31</TextMono>
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
                                className="text-right border-none"
                                size="xl"
                                value={minimumPayout}
                                onChange={handleMinimumPayoutChange}
                            />
                        </div>
                        <div className="flex justify-end">
                            <TextMono size="sm">$ 7,068.31</TextMono>
                        </div>
                    </div>
                </div>
            </div>
            <Button size="small" onClick={handleOnConfirm}>
                {t("label.collateral.picker.apply").toUpperCase()}
            </Button>
        </div>
    );
};
