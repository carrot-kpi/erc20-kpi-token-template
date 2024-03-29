import type {
    OracleInitializationBundle,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import type { ResolvedTemplate, Template } from "@carrot-kpi/sdk";
import { type Address } from "viem";

export interface Reward {
    chainId: number;
    address: Address;
    decimals: number;
    symbol: string;
    name: string;
    logoURI?: string;
    amount: string;
    minimumPayout: string;
}

export type Oracle = {
    templateId: number;
    state: object;
    suggestedExpirationTimestamp?: number;
};

export interface OracleWithTemplate extends Oracle {
    template: Template;
}

export interface OracleWithResolvedTemplate extends OracleWithTemplate {
    resolvedTemplate: ResolvedTemplate;
}

export interface OracleWithInitializationBundleGetter extends Oracle {
    getInitializationBundle: OracleInitializationBundleGetter;
}

export interface OracleWithInitializationBundle extends Oracle {
    initializationBundle: OracleInitializationBundle;
}

export type State = {
    // generic data
    title?: string;
    description?: string;
    tags?: string[];
    maximumSuggestedExirationTimestamp?: number;
    expiration?: number;
    tokenName?: string;
    tokenSymbol?: string;
    tokenSupply?: string;
    jitFundingFeatureEnabled?: boolean;

    // rewards
    rewards?: Reward[];

    // oracle
    oracles?: Oracle[];
};

export type ShareTarget = "x" | "discord" | "telegram";
