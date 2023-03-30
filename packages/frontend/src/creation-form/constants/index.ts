import { ChainId } from "@carrot-kpi/sdk";
import { Address } from "wagmi";
import { OutcomeConfigurationState } from "../types";

export const NO_SPECIAL_CHARACTERS_REGEX =
    /^[A-Z0-9@~`!@#$%^&*()_=+\\';:"\/?>.<,-\s]*$/i;

const COINGECKO_LIST = "https://tokens.coingecko.com/uniswap/all.json";
const CARROT_LIST = "https://carrot-kpi.dev/token-list.json";

export const TOKEN_LIST_URLS: string[] = [CARROT_LIST, COINGECKO_LIST];

export const PROTOCOL_FEE_BPS = 30;

export const MAX_KPI_TOKEN_DESCRIPTION_CHARS = 256;
export const MAX_KPI_TOKEN_TITLE_CHARS = 64;
export const MAX_KPI_TOKEN_TAG_CHARS = 16;
export const MAX_KPI_TOKEN_ERC20_NAME_CHARS = 24;
export const MAX_KPI_TOKEN_ERC20_SYMBOL_CHARS = 16;
export const MAX_KPI_TOKEN_TAGS_COUNT = 10;

export const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
    [ChainId.GNOSIS]: "0xc9CC9a4d4F2c57F0d47c169A3d96D47FfFe5E0b6",
    [ChainId.SEPOLIA]: "0xd5192f7DB2c20764aa66336F61f711e3Fe9CC43C",
};

export const DEFAULT_OUTCOME_CONFIGURATION: OutcomeConfigurationState = {
    automaticallyFilled: false,
    binary: false,
    lowerBound: {
        value: "",
        formattedValue: "",
    },
    higherBound: {
        value: "",
        formattedValue: "",
    },
};
