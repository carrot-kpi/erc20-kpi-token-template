import {
    ChangeEvent,
    ReactElement,
    useCallback,
    useEffect,
    useState,
} from "react";
import { NumberFormatValue, TokenData as TokenDataType } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button, NumberInput, TextInput } from "@carrot-kpi/ui";
import { utils } from "ethers";

interface TokenDataProps {
    t: NamespacedTranslateFunction;
    onNext: (tokenData: TokenDataType) => void;
}

export const TokenData = ({ t, onNext }: TokenDataProps): ReactElement => {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [supply, setSupply] = useState<NumberFormatValue>({
        floatValue: 0,
        formattedValue: "",
        value: "",
    });
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        setDisabled(!name || !symbol || !supply.floatValue);
    }, [name, supply.floatValue, symbol]);

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

    const handeNext = useCallback(() => {
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
            <Button size="small" onClick={handeNext} disabled={disabled}>
                {t("next")}
            </Button>
        </div>
    );
};
