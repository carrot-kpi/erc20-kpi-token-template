import type { ShareTarget } from "./types";
import { getCampaignLink as getKpiTokenLink } from "./utils/campaign";

export const NO_SPECIAL_CHARACTERS_REGEX =
    /^[A-Z0-9@~`!@#$%^&*()_=+\\';:"\/?>.<,-\s]*$/i;

export const COINGECKO_LIST_URL =
    "https://tokens.coingecko.com/uniswap/all.json";

export const MAX_KPI_TOKEN_DESCRIPTION_CHARS = 256;
export const MAX_KPI_TOKEN_TITLE_CHARS = 64;
export const MAX_KPI_TOKEN_TAG_CHARS = 16;
export const MAX_KPI_TOKEN_NAME_CHARS = 24;
export const MAX_KPI_TOKEN_SYMBOL_CHARS = 16;
export const MAX_KPI_TOKEN_TAGS_COUNT = 10;

export const DEFAULT_NUMBER_FORMAT_VALUE = {
    value: "",
    formattedValue: "",
};

export const JIT_FUNDING_FEATURE_ID = 1;

const SHARE_BASE_TEXT = "Checkout this new Carrot campaign!";

export const SHARE_INTENT_BASE_URL: Record<
    ShareTarget,
    (kpiTokenAddress: string) => string
> = {
    discord: (kpiTokenAddress: string) => {
        // TODO: implement
        return kpiTokenAddress;
    },
    telegram: (kpiTokenAddress: string) => {
        return `https://t.me/share/url?url=${encodeURIComponent(getKpiTokenLink(kpiTokenAddress))}&text=${encodeURIComponent(SHARE_BASE_TEXT)}`;
    },
    x: (kpiTokenAddress: string) => {
        const text = `${SHARE_BASE_TEXT} \n ${getKpiTokenLink(kpiTokenAddress)}`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    },
};
