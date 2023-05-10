import { CACHER } from "@carrot-kpi/sdk";
import { TokenInfoWithBalance } from "@carrot-kpi/ui";

export const tokenInfoWithBalanceEquals = (
    tokenA?: TokenInfoWithBalance | null,
    tokenB?: TokenInfoWithBalance | null
): boolean => {
    return !!(
        tokenA &&
        tokenB &&
        tokenA.chainId === tokenB.chainId &&
        tokenA.address.toLowerCase() === tokenB.address.toLowerCase()
    );
};

export const cacheTokenInfoWithBalance = (
    token: TokenInfoWithBalance
): void => {
    const serializableToken = { ...token };
    const cachingKey = `imported-erc20-tokens-${serializableToken.chainId}`;
    delete serializableToken.balance;
    const previouslyCachedTokensInChain = CACHER.getOrDefault<
        TokenInfoWithBalance[]
    >(cachingKey, []);
    if (
        previouslyCachedTokensInChain.some((cachedToken) =>
            tokenInfoWithBalanceEquals(serializableToken, cachedToken)
        )
    )
        return;
    previouslyCachedTokensInChain.push(serializableToken);
    CACHER.set(
        cachingKey,
        previouslyCachedTokensInChain,
        Number.MAX_SAFE_INTEGER
    );
};

export const cachedTokenInfoWithBalanceInChain = (
    chainId?: number | null
): TokenInfoWithBalance[] => {
    if (!chainId) return [];
    return CACHER.getOrDefault(`imported-erc20-tokens-${chainId}`, []);
};
