import {
    ChangeEvent,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { NumberFormatValue, TokenData as TokenDataType } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { NumberInput, TextInput } from "@carrot-kpi/ui";
import { utils } from "ethers";
import { PreviousButton } from "../previous-button";
import { NextButton } from "../next-button";

interface TokenDataProps {
    t: NamespacedTranslateFunction;
    tokenData: TokenDataType | null;
    onPrevious: () => void;
    onNext: (tokenData: TokenDataType) => void;
}

export const TokenData = ({
    t,
    tokenData,
    onPrevious,
    onNext,
}: TokenDataProps): ReactElement => {
    const [name, setName] = useState(tokenData?.name || "");
    const [symbol, setSymbol] = useState(tokenData?.symbol || "");
    const { defaultValue, defaultFormattedValue } = useMemo(() => {
        const defaultValue =
            !!tokenData && !!tokenData.supply
                ? tokenData.supply.toString()
                : "";
        const defaultFormattedValue = !!defaultValue
            ? utils.commify(defaultValue)
            : "";
        return { defaultValue, defaultFormattedValue };
    }, [tokenData]);
    const [supply, setSupply] = useState<NumberFormatValue>({
        formattedValue: defaultFormattedValue,
        value: defaultValue,
    });
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(
            !name || !symbol || !supply.value || parseFloat(supply.value) === 0
        );
    }, [name, supply.value, symbol]);

    const handleNameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
        },
        []
    );

    const handleSymbolChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSymbol(event.target.value);
        },
        []
    );

    const handleNext = useCallback(() => {
        onNext({
            name,
            symbol,
            supply: utils.parseUnits(supply.value, 18),
        });
    }, [name, onNext, supply.value, symbol]);

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="token-name"
                label={t("label.token.data.name")}
                placeholder={"Example"}
                onChange={handleNameChange}
                value={name}
                className="w-full"
            />
            <TextInput
                id="token-symbol"
                label={t("label.token.data.symbol")}
                placeholder={"XMPL"}
                onChange={handleSymbolChange}
                value={symbol}
                className="w-full"
            />
            <NumberInput
                id="token-supply"
                label={t("label.token.data.supply")}
                placeholder={"1,000,000"}
                onValueChange={setSupply}
                value={supply.toString()}
                className="w-full"
            />
            <div className="flex justify-between">
                <PreviousButton t={t} onClick={onPrevious} />
                <NextButton t={t} onClick={handleNext} disabled={disabled} />
            </div>
        </div>
    );
};
