import { BigNumber } from "ethers";
import { ChangeEvent, ReactElement, useCallback, useState } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Button } from "@carrot-kpi/ui";

interface OracleConfigurationProps {
    t: NamespacedTranslateFunction;
    onSubmit: (lowerBound: BigNumber, higherBound: BigNumber) => void;
}

export const OracleConfiguration = ({
    t,
    onSubmit,
}: OracleConfigurationProps): ReactElement => {
    const [lowerBound, setLowerBound] = useState(BigNumber.from("0"));
    const [higherBound, setHigherBound] = useState(BigNumber.from("0"));

    const handleLowerBoundChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setLowerBound(BigNumber.from(event.target.value));
        },
        []
    );

    const handleHigherBoundChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setHigherBound(BigNumber.from(event.target.value));
        },
        []
    );

    const handleNext = useCallback(() => {
        onSubmit(lowerBound, higherBound);
    }, [onSubmit, lowerBound, higherBound]);

    return (
        <>
            <div>
                <label htmlFor="lower-bound">{t("label.lower.bound")}</label>
                <br />
                <input
                    id="lower-bound"
                    placeholder="0"
                    onChange={handleLowerBoundChange}
                    value={lowerBound.toString()}
                />
                <br />
                <label htmlFor="higher-bound">{t("label.higher.bound")}</label>
                <br />
                <input
                    id="higher-bound"
                    placeholder="0"
                    onChange={handleHigherBoundChange}
                    value={higherBound.toString()}
                />
                <br />
                <Button size="small" onClick={handleNext}>
                    {t("next")}
                </Button>
            </div>
        </>
    );
};
