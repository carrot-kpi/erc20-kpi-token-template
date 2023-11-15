import {
    type ReactElement,
    useCallback,
    useEffect,
    useState,
    useMemo,
} from "react";
import type { State } from "../types";
import {
    type NamespacedTranslateFunction,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import {
    MarkdownInput,
    NumberInput,
    TagsInput,
    NextStepButton,
    DateTimeInput,
    Typography,
    type NumberFormatValues,
} from "@carrot-kpi/ui";
import {
    unixTimestampToDate,
    dateToUnixTimestamp,
    isUnixTimestampInThePast,
} from "../../utils/dates";
import { NoSpecialCharactersTextInput } from "./no-special-characters-text-input";
import {
    MAX_KPI_TOKEN_DESCRIPTION_CHARS,
    MAX_KPI_TOKEN_NAME_CHARS,
    MAX_KPI_TOKEN_SYMBOL_CHARS,
    MAX_KPI_TOKEN_TAGS_COUNT,
    MAX_KPI_TOKEN_TAG_CHARS,
    MAX_KPI_TOKEN_TITLE_CHARS,
} from "../constants";
import { formatUnits, parseUnits } from "viem";

interface GenericDataProps {
    t: NamespacedTranslateFunction;
    state: State;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: () => void;
}

const stripHtml = (value: string) => value.replace(/(<([^>]+)>)/gi, "");

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
    const [tokenNameErrorText, setTokenNameErrorText] = useState("");
    const [tokenSymbolErrorText, setTokenSymbolErrorText] = useState("");
    const [tokenSupplyErrorText, setTokenSupplyErrorText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [minimumDate, setMinimumDate] = useState(new Date());

    const memoizedStateDate = useMemo(() => {
        return state.expiration ? unixTimestampToDate(state.expiration) : null;
    }, [state.expiration]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMinimumDate(new Date());
        }, 1_000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        setDisabled(
            !state.title ||
                !state.description ||
                !state.tokenName ||
                !state.tokenSymbol ||
                !state.title.trim() ||
                state.title.trim().length > MAX_KPI_TOKEN_TITLE_CHARS ||
                !stripHtml(state.description).trim() ||
                stripHtml(state.description).trim().length >
                    MAX_KPI_TOKEN_DESCRIPTION_CHARS ||
                !state.tags ||
                state.tags.length === 0 ||
                state.tags.length > MAX_KPI_TOKEN_TAGS_COUNT ||
                !state.expiration ||
                isUnixTimestampInThePast(state.expiration) ||
                !state.tokenName.trim() ||
                state.tokenName.trim().length > MAX_KPI_TOKEN_NAME_CHARS ||
                !state.tokenSymbol.trim() ||
                state.tokenSymbol.trim().length > MAX_KPI_TOKEN_SYMBOL_CHARS ||
                !state.tokenSupply ||
                !state.tokenSupply ||
                parseFloat(state.tokenSupply) === 0,
        );
    }, [state]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMinimumDate(new Date());
        }, 1_000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const handleTitleChange = useCallback(
        (value: string): void => {
            setTitleErrorText(
                !value
                    ? t("error.title.empty")
                    : value.trim().length > MAX_KPI_TOKEN_TITLE_CHARS
                      ? t("error.title.tooLong", {
                            chars: MAX_KPI_TOKEN_TITLE_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({ ...state, title: value }));
        },
        [onStateChange, t],
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
                      : "",
            );
            onStateChange((state) => ({ ...state, description: value }));
        },
        [onStateChange, t],
    );

    const handleTagsChange = useCallback(
        (value: string[]) => {
            if (value.some((tag) => tag.length > MAX_KPI_TOKEN_TAG_CHARS)) {
                setTagsErrorText(
                    t("error.tags.tooLong", {
                        chars: MAX_KPI_TOKEN_TAG_CHARS,
                    }),
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
                      : "",
            );
            onStateChange((state) => ({ ...state, tags: value }));
        },
        [onStateChange, t],
    );

    const handleExpirationChange = useCallback(
        (value: Date) => {
            const converted = dateToUnixTimestamp(value);
            setExpirationErrorText(
                isUnixTimestampInThePast(converted)
                    ? t("error.expiration.past")
                    : "",
            );
            onStateChange((state) => ({
                ...state,
                expiration: converted,
            }));
        },
        [onStateChange, t],
    );

    const handleTokenNameChange = useCallback(
        (value: string) => {
            setTokenNameErrorText(
                !value
                    ? t("error.erc20.name.empty")
                    : value.trim().length > MAX_KPI_TOKEN_NAME_CHARS
                      ? t("error.erc20.name.tooLong", {
                            chars: MAX_KPI_TOKEN_NAME_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenName: value,
            }));
        },
        [onStateChange, t],
    );

    const handleTokenSymbolChange = useCallback(
        (value: string) => {
            setTokenSymbolErrorText(
                !value
                    ? t("error.erc20.symbol.empty")
                    : value.trim().length > MAX_KPI_TOKEN_SYMBOL_CHARS
                      ? t("error.erc20.symbol.tooLong", {
                            chars: MAX_KPI_TOKEN_SYMBOL_CHARS,
                        })
                      : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenSymbol: value,
            }));
        },
        [onStateChange, t],
    );

    const handleTokenSupplyChange = useCallback(
        (value: NumberFormatValues) => {
            setTokenSupplyErrorText(
                !value || !value.value || parseUnits(value.value, 18) === 0n
                    ? t("error.erc20.supply.zero")
                    : "",
            );
            onStateChange((state) => ({
                ...state,
                tokenSupply: parseUnits(value.value, 18).toString(),
            }));
        },
        [onStateChange, t],
    );

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
                value={memoizedStateDate}
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
            <div className="flex flex-col md:flex-row w-full gap-4">
                <NoSpecialCharactersTextInput
                    label={t("general.label.token.name")}
                    placeholder={"Example"}
                    onChange={handleTokenNameChange}
                    value={state.tokenName}
                    error={!!tokenNameErrorText}
                    errorText={tokenNameErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NoSpecialCharactersTextInput
                    label={t("general.label.token.symbol")}
                    placeholder={"XMPL"}
                    onChange={handleTokenSymbolChange}
                    value={state.tokenSymbol}
                    error={!!tokenSymbolErrorText}
                    errorText={tokenSymbolErrorText}
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
                    onValueChange={handleTokenSupplyChange}
                    value={
                        state.tokenSupply
                            ? formatUnits(BigInt(state.tokenSupply), 18)
                            : null
                    }
                    error={!!tokenSupplyErrorText}
                    errorText={tokenSupplyErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
            </div>
            <NextStepButton onClick={onNext} disabled={disabled}>
                {t("next")}
            </NextStepButton>
        </div>
    );
};
