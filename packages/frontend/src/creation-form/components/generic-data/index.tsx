import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { NumberFormatValue, SpecificationData, TokenData } from "../../types";
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
import { MAX_KPI_TOKEN_DESCRIPTION_CHARS } from "../../constants";

const stripHtml = (value: string) => value.replace(/(<([^>]+)>)/gi, "");

interface GenericDataProps {
    t: NamespacedTranslateFunction;
    specificationData: SpecificationData | null;
    tokenData: TokenData | null;
    onNext: (
        specificationData: SpecificationData,
        tokenData: TokenData
    ) => void;
}

export const GenericData = ({
    t,
    specificationData,
    tokenData,
    onNext,
}: GenericDataProps): ReactElement => {
    const [title, setTitle] = useState(specificationData?.title || "");
    const [description, setDescription] = useState(
        specificationData?.description || ""
    );
    const [tags, setTags] = useState<string[]>(specificationData?.tags || []);
    const [expiration, setExpiration] = useState<Date | null>(null);
    const [erc20Name, setERC20Name] = useState(tokenData?.name || "");
    const [erc20Symbol, setERC20Symbol] = useState(tokenData?.symbol || "");
    const { defaultValue, defaultFormattedValue } = useMemo(() => {
        const defaultValue =
            !!tokenData && !!tokenData.supply
                ? utils.formatUnits(tokenData.supply.toString(), 18)
                : "";
        const defaultFormattedValue = !!defaultValue
            ? utils.commify(defaultValue)
            : "";
        return { defaultValue, defaultFormattedValue };
    }, [tokenData]);
    const [erc20Supply, setERC20Supply] = useState<NumberFormatValue>({
        formattedValue: defaultFormattedValue,
        value: defaultValue,
    });
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
        setDisabled(
            !title ||
                !description ||
                !erc20Name ||
                !erc20Symbol ||
                !title.trim() ||
                !stripHtml(description).trim() ||
                stripHtml(description).trim().length >
                    MAX_KPI_TOKEN_DESCRIPTION_CHARS ||
                tags.length === 0 ||
                !expiration ||
                isInThePast(expiration) ||
                !erc20Name.trim() ||
                !erc20Symbol.trim() ||
                !erc20Supply.value ||
                parseFloat(erc20Supply.value) === 0
        );
    }, [
        description,
        erc20Name,
        erc20Supply.value,
        erc20Symbol,
        expiration,
        tags.length,
        title,
    ]);

    const handleTitleChange = useCallback(
        (value: string): void => {
            setTitle(value);
            setTitleErrorText(!value ? t("error.title.empty") : "");
        },
        [t]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescription(value);
            setDescriptionErrorText(
                !trimmedValue
                    ? t("error.description.empty")
                    : trimmedValue.length > MAX_KPI_TOKEN_DESCRIPTION_CHARS
                    ? t("error.description.tooLong")
                    : ""
            );
        },
        [t]
    );

    const handleTagsChange = useCallback(
        (value: string[]) => {
            if (value.some((tag, i) => value.indexOf(tag) !== i)) {
                setTagsErrorText(t("error.tags.duplicated"));
                return;
            }
            setTags(value);
            setTagsErrorText(value.length === 0 ? t("error.tags.empty") : "");
        },
        [t]
    );

    const handleExpirationChange = useCallback(
        (value: Date) => {
            setExpiration(value);
            setExpirationErrorText(
                isInThePast(value) ? t("error.expiration.past") : ""
            );
        },
        [t]
    );

    const handleERC20NameChange = useCallback(
        (value: string) => {
            setERC20Name(value);
            setERC20NameErrorText(!value ? t("error.erc20.name.empty") : "");
        },
        [t]
    );

    const handleERC20SymbolChange = useCallback(
        (value: string) => {
            setERC20Symbol(value);
            setERC20SymbolErrorText(
                !value ? t("error.erc20.symbol.empty") : ""
            );
        },
        [t]
    );

    const handleERC20SupplyChange = useCallback(
        (value: NumberFormatValue) => {
            setERC20Supply(value);
            setERC20SupplyErrorText(
                !value || !value.value || BigNumber.from(value.value).isZero()
                    ? t("error.erc20.supply.zero")
                    : ""
            );
        },
        [t]
    );

    const handleNext = useCallback(() => {
        if (
            !title ||
            !description ||
            tags.length === 0 ||
            !expiration ||
            !erc20Name ||
            !erc20Supply ||
            !erc20Supply.value ||
            !erc20Symbol
        )
            return;
        onNext(
            {
                title,
                description,
                tags,
                expiration,
            },
            {
                name: erc20Name,
                supply: utils.parseUnits(erc20Supply.value, 18),
                symbol: erc20Symbol,
            }
        );
    }, [
        description,
        erc20Name,
        erc20Supply,
        erc20Symbol,
        expiration,
        onNext,
        tags,
        title,
    ]);

    return (
        <div className="flex flex-col gap-6">
            <NoSpecialCharactersTextInput
                label={t("general.label.title")}
                placeholder={t("general.placeholder.title")}
                onChange={handleTitleChange}
                value={title}
                error={!!titleErrorText}
                errorText={t("error.title.empty")}
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
                value={description}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <TagsInput
                label={t("general.label.tags")}
                placeholder={t("general.placeholder.tags")}
                onChange={handleTagsChange}
                value={tags}
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
                value={expiration}
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
                    value={erc20Name}
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
                    value={erc20Symbol}
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
                    value={erc20Supply.formattedValue}
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
