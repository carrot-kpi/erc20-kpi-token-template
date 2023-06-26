import { type ReactElement, useCallback, useEffect, useState } from "react";
import type {
    GenericDataStepState,
    NumberFormatValue,
    SpecificationData,
    TokenData,
} from "../../types";
import { useDecentralizedStorageUploader } from "@carrot-kpi/react";
import {
    MarkdownInput,
    NumberInput,
    TagsInput,
    NextStepButton,
    DateTimeInput,
    Typography,
} from "@carrot-kpi/ui";
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
import { parseUnits } from "viem";

interface GenericDataProps {
    state: GenericDataStepState;
    onStateChange: (state: GenericDataStepState) => void;
    onNext: (
        partialSpecificationData: SpecificationData,
        specificationCID: string,
        partialTokenData: TokenData
    ) => void;
}

export const GenericData = ({
    state,
    onStateChange,
    onNext,
}: GenericDataProps): ReactElement => {
    const uploadToDecentralizedStorage =
        useDecentralizedStorageUploader("ipfs");

    const [titleErrorText, setTitleErrorText] = useState("");
    const [descriptionErrorText, setDescriptionErrorText] = useState("");
    const [tagsErrorText, setTagsErrorText] = useState("");
    const [expirationErrorText, setExpirationErrorText] = useState("");
    const [erc20NameErrorText, setERC20NameErrorText] = useState("");
    const [erc20SymbolErrorText, setERC20SymbolErrorText] = useState("");
    const [erc20SupplyErrorText, setERC20SupplyErrorText] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

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
                    ? "test"
                    : value.trim().length > MAX_KPI_TOKEN_TITLE_CHARS
                    ? "test"
                    : ""
            );
            onStateChange({ ...state, title: value });
        },
        [onStateChange, state]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescriptionErrorText(
                !trimmedValue
                    ? "test"
                    : trimmedValue.length > MAX_KPI_TOKEN_DESCRIPTION_CHARS
                    ? "test"
                    : ""
            );
            onStateChange({ ...state, description: value });
        },
        [onStateChange, state]
    );

    const handleTagsChange = useCallback(
        (value: string[]) => {
            if (value.some((tag) => tag.length > MAX_KPI_TOKEN_TAG_CHARS)) {
                setTagsErrorText("test");
                return;
            }
            if (value.some((tag, i) => value.indexOf(tag) !== i)) {
                setTagsErrorText("test");
                return;
            }
            setTagsErrorText(
                value.length === 0
                    ? "test"
                    : value.length > MAX_KPI_TOKEN_TAGS_COUNT
                    ? "test"
                    : ""
            );
            onStateChange({ ...state, tags: value });
        },
        [onStateChange, state]
    );

    const handleExpirationChange = useCallback(
        (value: Date) => {
            setExpirationErrorText(isInThePast(value) ? "test" : "");
            onStateChange({ ...state, expiration: value });
        },
        [onStateChange, state]
    );

    const handleERC20NameChange = useCallback(
        (value: string) => {
            setERC20NameErrorText(
                !value
                    ? "test"
                    : value.trim().length > MAX_KPI_TOKEN_ERC20_NAME_CHARS
                    ? "test"
                    : ""
            );
            onStateChange({
                ...state,
                erc20Name: value,
            });
        },
        [onStateChange, state]
    );

    const handleERC20SymbolChange = useCallback(
        (value: string) => {
            setERC20SymbolErrorText(
                !value
                    ? "test"
                    : value.trim().length > MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS
                    ? "test"
                    : ""
            );
            onStateChange({
                ...state,
                erc20Symbol: value,
            });
        },
        [onStateChange, state]
    );

    const handleERC20SupplyChange = useCallback(
        (value: NumberFormatValue) => {
            setERC20SupplyErrorText(
                !value ||
                    !value.value ||
                    BigInt(
                        !isNaN(parseInt(value.value))
                            ? parseFloat(value.value)
                            : 0
                    ) === 0n
                    ? "test"
                    : ""
            );
            onStateChange({
                ...state,
                erc20Supply: value,
            });
        },
        [onStateChange, state]
    );

    const handleNext = useCallback(async () => {
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
        const specificationData: SpecificationData = {
            title: state.title,
            description: state.description,
            tags: state.tags,
            expiration: state.expiration,
        };
        let specificationCID;
        try {
            setLoading(true);
            specificationCID = await uploadToDecentralizedStorage(
                JSON.stringify(specificationData)
            );
        } catch (error) {
            console.warn("error while uploading specification to ipfs", error);
            return;
        } finally {
            setLoading(false);
        }
        onNext(specificationData, specificationCID, {
            name: state.erc20Name,
            supply: parseUnits(state.erc20Supply.value as `${number}`, 18),
            symbol: state.erc20Symbol,
        });
    }, [
        onNext,
        state.description,
        state.erc20Name,
        state.erc20Supply,
        state.erc20Symbol,
        state.expiration,
        state.tags,
        state.title,
        uploadToDecentralizedStorage,
    ]);

    return (
        <div className="flex flex-col gap-6">
            <NoSpecialCharactersTextInput
                label={"test"}
                placeholder={"test"}
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
                label={"test"}
                placeholder={"test"}
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
                label={"test"}
                placeholder={"test"}
                onChange={handleTagsChange}
                value={state.tags}
                error={!!tagsErrorText}
                errorText={tagsErrorText}
                messages={{ add: "test" }}
                className={{
                    root: "w-full",
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <DateTimeInput
                label={"test"}
                placeholder={"test"}
                onChange={handleExpirationChange}
                value={state.expiration}
                error={!!expirationErrorText}
                errorText={expirationErrorText}
                info={
                    <>
                        <Typography variant="sm" className={{ root: "mb-2" }}>
                            {"test"}
                        </Typography>
                        <Typography variant="sm">{"test"}</Typography>
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
                    label={"test"}
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
                    label={"test"}
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
                    label={"test"}
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
            <NextStepButton
                onClick={handleNext}
                disabled={disabled}
                loading={loading}
            >
                {"test"}
            </NextStepButton>
        </div>
    );
};
