import { ChangeEvent, ReactElement } from "react";
import { ERC20Data } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button, NumberInput, TextInput } from "@carrot-kpi/ui";

interface Erc20Props {
    t: NamespacedTranslateFunction;
    erc20: ERC20Data;
    onFieldChange: (field: "name" | "symbol" | "supply", value: string) => void;
    onNext: () => void;
}

export const ERC20 = ({
    t,
    erc20,
    onFieldChange,
    onNext,
}: Erc20Props): ReactElement => {
    const handleNameChange =
        (field: keyof ERC20Data) => (event: ChangeEvent<HTMLInputElement>) => {
            onFieldChange(field, event.target.value);
        };

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="erc20-name"
                label={t("label.erc20.name")}
                placeholder={"Ethereum"}
                onChange={handleNameChange("name")}
                value={erc20.name}
                className="w-full"
            />
            <TextInput
                id="erc20-symbol"
                label={t("label.erc20.symbol")}
                placeholder={"ETH"}
                onChange={handleNameChange("symbol")}
                value={erc20.symbol}
                className="w-full"
            />
            <NumberInput
                id="erc20-supply"
                label={t("label.erc20.supply")}
                placeholder={"1,000,000"}
                onChange={handleNameChange("supply")}
                value={erc20.supply.toString()}
                className="w-full"
            />
            <Button size="small" onClick={onNext}>
                {t("next")}
            </Button>
        </div>
    );
};
