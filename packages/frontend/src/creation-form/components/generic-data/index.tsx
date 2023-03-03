import {
    ChangeEvent,
    FocusEvent,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { NumberFormatValue, SpecificationData, TokenData } from "../../types";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import {
    TextInput,
    MarkdownInput,
    NumberInput,
    TagsInput,
    NextStepButton,
    DateTimeInput,
} from "@carrot-kpi/ui";
import { BigNumber, utils } from "ethers";
import { isInThePast } from "../../../utils/dates";

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

    useEffect(() => {
        setDisabled(
            !title ||
                !description ||
                !erc20Name ||
                !erc20Symbol ||
                !title.trim() ||
                !stripHtml(description).trim() ||
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

    const handleOnBlur = useCallback(
        (stateUpdater: (value: string) => void) =>
            (event: FocusEvent<HTMLInputElement>) => {
                stateUpdater(event.target.value.trim());
            },
        []
    );

    const handleTitleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setTitle(event.target.value);
            setTitleErrorText(
                !event.target.value ? t("error.title.empty") : ""
            );
        },
        [t]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescription(value);
            setDescriptionErrorText(
                !trimmedValue ? t("error.description.empty") : ""
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
        (event: ChangeEvent<HTMLInputElement>) => {
            setERC20Name(event.target.value);
            setERC20NameErrorText(
                !event.target.value ? t("error.erc20.name.empty") : ""
            );
        },
        [t]
    );

    const handleERC20SymbolChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const trimmedValue = event.target.value.trim();
            setERC20Symbol(trimmedValue);
            setERC20SymbolErrorText(
                !trimmedValue ? t("error.erc20.symbol.empty") : ""
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
            <TextInput
                id="title"
                label={t("general.label.title")}
                placeholder={t("general.placeholder.title")}
                onChange={handleTitleChange}
                onBlur={handleOnBlur(setTitle)}
                value={title}
                error={!!titleErrorText}
                helperText={titleErrorText}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <MarkdownInput
                id="description"
                label={t("general.label.description")}
                placeholder={t("general.placeholder.description")}
                onChange={handleDescriptionChange}
                error={!!descriptionErrorText}
                helperText={descriptionErrorText}
                value={description}
                className={{
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <div className="flex w-full gap-4">
                <TagsInput
                    id="tags"
                    label={t("general.label.tags")}
                    placeholder={t("general.placeholder.tags")}
                    onChange={handleTagsChange}
                    value={tags}
                    error={!!tagsErrorText}
                    helperText={tagsErrorText}
                    messages={{ add: t("add") }}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <DateTimeInput
                    id="expiration"
                    label={t("general.label.expiration")}
                    placeholder={t("general.placeholder.expiration")}
                    onChange={handleExpirationChange}
                    value={expiration}
                    error={!!expirationErrorText}
                    helperText={expirationErrorText}
                    min={new Date()}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
            </div>
            <div className="flex w-full gap-4">
                <TextInput
                    id="token-name"
                    label={t("general.label.token.name")}
                    placeholder={"Example"}
                    onChange={handleERC20NameChange}
                    onBlur={handleOnBlur(setERC20Name)}
                    value={erc20Name}
                    error={!!erc20NameErrorText}
                    helperText={erc20NameErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <TextInput
                    id="token-symbol"
                    label={t("general.label.token.symbol")}
                    placeholder={"XMPL"}
                    onChange={handleERC20SymbolChange}
                    value={erc20Symbol}
                    error={!!erc20SymbolErrorText}
                    helperText={erc20SymbolErrorText}
                    className={{
                        root: "w-full",
                        input: "w-full",
                        inputWrapper: "w-full",
                    }}
                />
                <NumberInput
                    id="token-supply"
                    allowNegative={false}
                    label={t("general.label.token.supply")}
                    placeholder={"1,000,000"}
                    onValueChange={handleERC20SupplyChange}
                    value={erc20Supply.formattedValue}
                    error={!!erc20SupplyErrorText}
                    helperText={erc20SupplyErrorText}
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
