import { createRequire } from "module";
import { fileURLToPath } from "url";
import { parseUnits, getContract } from "viem";

const require = createRequire(fileURLToPath(import.meta.url));

export const setupFork = async ({
    nodeClient,
    walletClient,
    kpiTokensManager,
    predictedTemplateId,
}) => {
    // deploy template
    const {
        abi: templateAbi,
        bytecode: { object: templateBytecode },
    } = require("../out/ERC20KPIToken.sol/ERC20KPIToken.json");

    const { contractAddress: templateAddress } =
        await nodeClient.getTransactionReceipt({
            hash: await walletClient.deployContract({
                abi: templateAbi,
                bytecode: templateBytecode,
                args: [10_000], // 1% default fee
            }),
        });

    // deploy test erc20 tokens
    const {
        abi: erc20Abi,
        bytecode: { object: erc20Bytecode },
    } = require("../out/Dependencies.sol/ERC20Mintable.json");
    const { contractAddress: tst1Address } =
        await nodeClient.getTransactionReceipt({
            hash: await walletClient.deployContract({
                abi: erc20Abi,
                bytecode: erc20Bytecode,
                args: ["Test token 1 (18)", "TST1", 18],
            }),
        });
    const tst1Contract = getContract({
        abi: erc20Abi,
        address: tst1Address,
        client: {
            public: nodeClient,
            wallet: walletClient,
        },
    });

    const { contractAddress: tst2Address } =
        await nodeClient.getTransactionReceipt({
            hash: await walletClient.deployContract({
                abi: erc20Abi,
                bytecode: erc20Bytecode,
                args: ["Test token 2 (6)", "TST2", 6],
            }),
        });
    const tst2Contract = getContract({
        abi: erc20Abi,
        address: tst2Address,
        client: {
            public: nodeClient,
            wallet: walletClient,
        },
    });

    const { contractAddress: tst3Address } =
        await nodeClient.getTransactionReceipt({
            hash: await walletClient.deployContract({
                abi: erc20Abi,
                bytecode: erc20Bytecode,
                args: ["Test token 3 (0)", "TST3", 0],
            }),
        });
    const tst3Contract = getContract({
        abi: erc20Abi,
        address: tst3Address,
        client: {
            public: nodeClient,
            wallet: walletClient,
        },
    });

    // mint some test erc20 tokens to signer
    await tst1Contract.write.mint([
        walletClient.account.address,
        parseUnits("100", 18),
    ]);
    await tst2Contract.write.mint([
        walletClient.account.address,
        parseUnits("100", 6),
    ]);
    await tst3Contract.write.mint([walletClient.account.address, 100n]);

    // allow connected address to use the jit funding feature
    const kpiTokensManagerOwner = await kpiTokensManager.read.owner();
    await kpiTokensManager.write.enableTemplateFeatureFor(
        [
            predictedTemplateId,
            1, // const jit funding feature id
            walletClient.account.address,
        ],
        {
            account: kpiTokensManagerOwner,
        },
    );

    return {
        templateAddress,
        customContracts: [
            {
                name: "ERC20 1",
                address: tst1Address,
            },
            {
                name: "ERC20 2",
                address: tst2Address,
            },
            {
                name: "ERC20 3",
                address: tst3Address,
            },
        ],
        frontendGlobals: {
            CCT_ERC20_1_ADDRESS: tst1Address,
            CCT_ERC20_2_ADDRESS: tst2Address,
            CCT_ERC20_3_ADDRESS: tst3Address,
        },
    };
};
