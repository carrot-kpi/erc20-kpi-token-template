import { ReactElement, useCallback, useEffect, useState } from "react";
import {
    GenericDataStepState,
    NumberFormatValue,
    SpecificationData,
    TokenData,
} from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    MarkdownInput,
    NumberInput,
    TagsInput,
    NextStepButton,
    DateTimeInput,
    Typography,
} from "@carrot-kpi/ui";
import { BigNumber, utils } from "ethers";
import { isInThePast } from "../../../utils/dates";
import { NoSpecialCharactersTextInput } from "../no-special-characters-text-input";
import {
    MAX_KPI_TOKEN_DESCRIPTION_CHARS,
    MAX_KPI_TOKEN_ERC20_NAME_CHARS,
    MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS,
    MAX_KPI_TOKEN_TAGS_COUNT,
    MAX_KPI_TOKEN_TAG_CHARS,
    MAX_KPI_TOKEN_TITLE_CHARS,
} from "../../constants";
import {
    isGenericDataStepStateInvalid,
    stripHtml,
} from "../../utils/validation";

interface GenericDataProps {
    t: NamespacedTranslateFunction;
    state: GenericDataStepState;
    onStateChange: (state: GenericDataStepState) => void;
    onNext: (
        partialSpecificationData: SpecificationData,
        partialTokenData: TokenData
    ) => void;
}

export const GenericData = ({
    t,
    state,
    onStateChange,
    onNext,
}: GenericDataProps): ReactElement => {
    const [titleErrorText, setTitleErrorText] = useState("");
    const [descriptionErrorText, setDescriptionErrorText] = useState("");
    const [tagsErrorText, setTagsErrorText] = useState("");
    const [expirationErrorText, setExpirationErrorText] = useState("");
    const [erc20NameErrorText, setERC20NameErrorText] = useState("");
    const [erc20SymbolErrorText, setERC20SymbolErrorText] = useState("");
    const [erc20SupplyErrorText, setERC20SupplyErrorText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [minimumDate, setMinimumDate] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setMinimumDate(new Date());
        }, 1_000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setDisabled(isGenericDataStepStateInvalid(state));
    }, [state]);

    const handleTitleChange = useCallback(
        (value: string): void => {
            setTitleErrorText(
                !value
                    ? t("error.title.empty")
                    : value.trim().length > MAX_KPI_TOKEN_TITLE_CHARS
                    ? t("error.title.tooLong", {
                          chars: MAX_KPI_TOKEN_TITLE_CHARS,
                      })
                    : ""
            );
            onStateChange({ ...state, title: value });
        },
        [onStateChange, state, t]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescriptionErrorText(
                !trimmedValue
                    ? t("error.description.empty")
                    : trimmedValue.length > MAX_KPI_TOKEN_DESCRIPTION_CHARS
                    ? t("error.description.tooLong", {
                          chars: MAX_KPI_TOKEN_DESCRIPTION_CHARS,
                      })
                    : ""
            );
            onStateChange({ ...state, description: value });
        },
        [onStateChange, state, t]
    );

    const handleTagsChange = useCallback(
        (value: string[]) => {
            if (value.some((tag) => tag.length > MAX_KPI_TOKEN_TAG_CHARS)) {
                setTagsErrorText(
                    t("error.tags.tooLong", {
                        chars: MAX_KPI_TOKEN_TAG_CHARS,
                    })
                );
                return;
            }
            if (value.some((tag, i) => value.indexOf(tag) !== i)) {
                setTagsErrorText(t("error.tags.duplicated"));
                return;
            }
            setTagsErrorText(
                value.length === 0
                    ? t("error.tags.empty")
                    : value.length > MAX_KPI_TOKEN_TAGS_COUNT
                    ? t("error.tags.tooMany", {
                          count: MAX_KPI_TOKEN_TAGS_COUNT,
                      })
                    : ""
            );
            onStateChange({ ...state, tags: value });
        },
        [onStateChange, state, t]
    );

    const handleExpirationChange = useCallback(
        (value: Date) => {
            setExpirationErrorText(
                isInThePast(value) ? t("error.expiration.past") : ""
            );
            onStateChange({ ...state, expiration: value });
        },
        [onStateChange, state, t]
    );

    const handleERC20NameChange = useCallback(
        (value: string) => {
            setERC20NameErrorText(
                !value
                    ? t("error.erc20.name.empty")
                    : value.trim().length > MAX_KPI_TOKEN_ERC20_NAME_CHARS
                    ? t("error.erc20.name.tooLong", {
                          chars: MAX_KPI_TOKEN_ERC20_NAME_CHARS,
                      })
                    : ""
            );
            onStateChange({
                ...state,
                erc20Name: value,
            });
        },
        [onStateChange, state, t]
    );

    const handleERC20SymbolChange = useCallback(
        (value: string) => {
            setERC20SymbolErrorText(
                !value
                    ? t("error.erc20.symbol.empty")
                    : value.trim().length > MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS
                    ? t("error.erc20.symbol.tooLong", {
                          chars: MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS,
                      })
                    : ""
            );
            onStateChange({
                ...state,
                erc20Symbol: value,
            });
        },
        [onStateChange, state, t]
    );

    const handleERC20SupplyChange = useCallback(
        (value: NumberFormatValue) => {
            setERC20SupplyErrorText(
                !value ||
                    !value.value ||
                    BigNumber.from(
                        !isNaN(parseInt(value.value)) ? value.value : "0"
                    ).isZero()
                    ? t("error.erc20.supply.zero")
                    : ""
            );
            onStateChange({
                ...state,
                erc20Supply: value,
            });
        },
        [onStateChange, state, t]
    );

    const handleNext = useCallback(() => {
        if (
            !state.title ||
            !state.description ||
            !state.tags ||
            state.tags.length === 0 ||
            !state.expiration ||
            !state.erc20Name ||
            !state.erc20Supply ||
            !state.erc20Supply.value ||
            !state.erc20Symbol
        )
            return;
        onNext(
            {
                title: state.title,
                description: state.description,
                tags: state.tags,
                expiration: state.expiration,
            },
            {
                name: state.erc20Name,
                supply: utils.parseUnits(state.erc20Supply.value, 18),
                symbol: state.erc20Symbol,
            }
        );
    }, [
        onNext,
        state.description,
        state.erc20Name,
        state.erc20Supply,
        state.erc20Symbol,
        state.expiration,
        state.tags,
        state.title,
    ]);

    return (
        <div className="flex flex-col gap-6">
            <NoSpecialCharactersTextInput
                label={t("general.label.title")}
                placeholder={t("general.placeholder.title")}
                onChange={handleTitleChange}
                value={state.title}
                error={!!titleErrorText}
                errorText={titleErrorText}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <MarkdownInput
                label={t("general.label.description")}
                placeholder={t("general.placeholder.description")}
                onChange={handleDescriptionChange}
                error={!!descriptionErrorText}
                errorText={descriptionErrorText}
                value={state.description}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <TagsInput
                label={t("general.label.tags")}
                placeholder={t("general.placeholder.tags")}
                onChange={handleTagsChange}
                value={state.tags}
                error={!!tagsErrorText}
                errorText={tagsErrorText}
                messages={{ add: t("add") }}
                className={{
                    root: "w-full",
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <DateTimeInput
                label={t("general.label.expiration")}
                placeholder={t("general.placeholder.expiration")}
                onChange={handleExpirationChange}
                value={state.expiration}
                error={!!expirationErrorText}
                errorText={expirationErrorText}
                info={
                    <>
                        <Typography variant="sm" className={{ root: "mb-2" }}>
                            {t("general.info.expiration.1")}
                        </Typography>
                        <Typography variant="sm">
                            {t("general.info.expiration.2")}
                        </Typography>
                    </>
                }
                min={minimumDate}
                className={{
                    root: "w-full",
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <div className="flex w-full gap-4">
                <NoSpecialCharactersTextInput
                    label={t("general.label.token.name")}
                    placeholder={"Example"}
                    onChange={handleERC20NameChange}
                    value={state.erc20Name}
                    error={!!erc20NameErrorText}
                    errorText={erc20NameErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NoSpecialCharactersTextInput
                    label={t("general.label.token.symbol")}
                    placeholder={"XMPL"}
                    onChange={handleERC20SymbolChange}
                    value={state.erc20Symbol}
                    error={!!erc20SymbolErrorText}
                    errorText={erc20SymbolErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NumberInput
                    allowNegative={false}
                    label={t("general.label.token.supply")}
                    placeholder={"1,000,000"}
                    onValueChange={handleERC20SupplyChange}
                    value={state.erc20Supply?.formattedValue}
                    error={!!erc20SupplyErrorText}
                    errorText={erc20SupplyErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
            </div>
            <NextStepButton onClick={handleNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
