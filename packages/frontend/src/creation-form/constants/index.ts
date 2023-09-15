export const NO_SPECIAL_CHARACTERS_REGEX =
    /^[A-Z0-9@~`!@#$%^&*()_=+\\';:"\/?>.<,-\s]*$/i;

const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
const CARROT_LIST = "https://static.carrot-kpi.dev/token-list.json";

export const TOKEN_LIST_URLS: string[] = [CARROT_LIST, COINGECKO_LIST];

export const PROTOCOL_FEE_BPS = 30;

export const MAX_KPI_TOKEN_DESCRIPTION_CHARS = 256;
export const MAX_KPI_TOKEN_TITLE_CHARS = 64;
export const MAX_KPI_TOKEN_TAG_CHARS = 16;
export const MAX_KPI_TOKEN_ERC20_NAME_CHARS = 24;
export const MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS = 16;
export const MAX_KPI_TOKEN_TAGS_COUNT = 10;

export const DEFAULT_NUMBER_FORMAT_VALUE = {
    value: "",
    formattedValue: "",
};
