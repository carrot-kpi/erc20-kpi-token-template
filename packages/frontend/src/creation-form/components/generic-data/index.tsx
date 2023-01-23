import {
    ChangeEvent,
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
} from "@carrot-kpi/ui";
import { NextButton } from "../next-button";
import { BigNumber, utils } from "ethers";
import { usePrevious } from "../../../utils/usePrevious";

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
    const [erc20NameErrorText, setERC20NameErrorText] = useState("");
    const [erc20SymbolErrorText, setERC20SymbolErrorText] = useState("");
    const [erc20SupplyErrorText, setERC20SupplyErrorText] = useState("");
    const [tagsError, setTagsError] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const prevTags = usePrevious<string[]>(tags);

    useEffect(() => {
        if (prevTags && prevTags.length > 0 && tags.length === 0) {
            setTagsError(true);
            return;
        }

        if (tags.length > 0) {
            setTagsError(false);
            return;
        }
    }, [prevTags, tags]);

    useEffect(() => {
        setDisabled(
            !title ||
                !description ||
                !erc20Name ||
                !erc20Symbol ||
                !title.trim() ||
                !stripHtml(description).trim() ||
                !erc20Name.trim() ||
                !erc20Symbol.trim() ||
                !erc20Supply.value ||
                parseFloat(erc20Supply.value) === 0
        );
    }, [description, erc20Name, erc20Supply.value, erc20Symbol, title]);

    const handleTitleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const trimmedValue = event.target.value.trim();
            setTitle(trimmedValue);
            setTitleErrorText(!trimmedValue ? t("error.title") : "");
        },
        [t]
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const trimmedValue = stripHtml(value).trim();
            setDescription(value);
            setDescriptionErrorText(
                !trimmedValue ? t("error.description") : ""
            );
        },
        [t]
    );

    const handleTagsChange = useCallback(
        (value: string[]) => {
            setTags(value);
            setTagsErrorText(tagsError ? t("error.tags") : "");
        },
        [tagsError, t]
    );

    const handleERC20NameChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const trimmedValue = event.target.value.trim();
            setERC20Name(trimmedValue);
            setERC20NameErrorText(!trimmedValue ? t("error.erc20.name") : "");
        },
        [t]
    );

    const handleERC20SymbolChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const trimmedValue = event.target.value.trim();
            setERC20Symbol(trimmedValue);
            setERC20SymbolErrorText(
                !trimmedValue ? t("error.erc20.symbol") : ""
            );
        },
        [t]
    );

    const handleERC20SupplyChange = useCallback(
        (value: NumberFormatValue) => {
            setERC20Supply(value);
            setERC20SupplyErrorText(
                !value || !value.value || BigNumber.from(value.value).isZero()
                    ? t("error.erc20.supply")
                    : ""
            );
        },
        [t]
    );

    const handleNext = useCallback(() => {
        if (
            !title ||
            !description ||
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
            },
            {
                name: erc20Name,
                supply: utils.parseUnits(erc20Supply.value, 18),
                symbol: erc20Symbol,
            }
        );
    }, [description, erc20Name, erc20Supply, erc20Symbol, onNext, tags, title]);

    return (
        <div className="flex flex-col gap-6">
            <TextInput
                id="title"
                label={t("label.title")}
                placeholder={"Enter campaign title"}
                onChange={handleTitleChange}
                value={title}
                error={!!titleErrorText}
                helperText={titleErrorText}
                className="w-full"
            />
            <MarkdownInput
                id="description"
                label={t("label.description")}
                placeholder={"Enter campaign description"}
                onChange={handleDescriptionChange}
                error={!!descriptionErrorText}
                helperText={descriptionErrorText}
                value={description}
            />
            <TagsInput
                id="description"
                label={t("label.tags")}
                placeholder={"Enter campaign description"}
                onChange={handleTagsChange}
                value={tags}
                error={tagsError}
                helperText={tagsErrorText}
                className="w-full"
            />
            <TextInput
                id="token-name"
                label={t("label.token.data.name")}
                placeholder={"Example"}
                onChange={handleERC20NameChange}
                value={erc20Name}
                error={!!erc20NameErrorText}
                helperText={erc20NameErrorText}
                className="w-full"
            />
            <TextInput
                id="token-symbol"
                label={t("label.token.data.symbol")}
                placeholder={"XMPL"}
                onChange={handleERC20SymbolChange}
                value={erc20Symbol}
                error={!!erc20SymbolErrorText}
                helperText={erc20SymbolErrorText}
                className="w-full"
            />
            <NumberInput
                id="token-supply"
                label={t("label.token.data.supply")}
                placeholder={"1,000,000"}
                onValueChange={handleERC20SupplyChange}
                value={erc20Supply.formattedValue}
                error={!!erc20SupplyErrorText}
                helperText={erc20SupplyErrorText}
                className="w-full"
            />
            <div className="flex justify-end">
                <NextButton t={t} onClick={handleNext} disabled={disabled} />
            </div>
        </div>
    );
};
