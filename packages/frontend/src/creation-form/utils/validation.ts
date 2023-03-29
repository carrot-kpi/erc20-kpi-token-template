import { isInThePast } from "../../utils/dates";
import {
    MAX_KPI_TOKEN_DESCRIPTION_CHARS,
    MAX_KPI_TOKEN_ERC20_NAME_CHARS,
    MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS,
    MAX_KPI_TOKEN_TAGS_COUNT,
    MAX_KPI_TOKEN_TITLE_CHARS,
} from "../constants";
import { GenericDataStepState } from "../types";

export const stripHtml = (value: string) => value.replace(/(<([^>]+)>)/gi, "");

export const isGenericDataStepStateInvalid = (state: GenericDataStepState) => {
    return (
        !state.title ||
        !state.description ||
        !state.erc20Name ||
        !state.erc20Symbol ||
        !state.title.trim() ||
        state.title.trim().length > MAX_KPI_TOKEN_TITLE_CHARS ||
        !stripHtml(state.description).trim() ||
        stripHtml(state.description).trim().length >
            MAX_KPI_TOKEN_DESCRIPTION_CHARS ||
        !state.tags ||
        state.tags.length === 0 ||
        state.tags.length > MAX_KPI_TOKEN_TAGS_COUNT ||
        !state.expiration ||
        isInThePast(state.expiration) ||
        !state.erc20Name.trim() ||
        state.erc20Name.trim().length > MAX_KPI_TOKEN_ERC20_NAME_CHARS ||
        !state.erc20Symbol.trim() ||
        state.erc20Symbol.trim().length > MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS ||
        !state.erc20Supply ||
        !state.erc20Supply.value ||
        parseFloat(state.erc20Supply.value) === 0
    );
};
