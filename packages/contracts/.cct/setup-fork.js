import { utils, ContractFactory } from "ethers";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const require = createRequire(fileURLToPath(import.meta.url));

export const setupFork = async (
    factory,
    kpiTokensManager,
    _oraclesManager,
    _multicall,
    predictedTemplateId,
    signer
) => {
    // deploy template
    const {
        abi: templateAbi,
        bytecode: templateBytecode,
    } = require("../artifacts/ERC20KPIToken.sol/ERC20KPIToken.json");
    const templateFactory = new ContractFactory(
        templateAbi,
        templateBytecode,
        signer
    );
    const templateContract = await templateFactory.deploy();
    await templateContract.deployed();

    const chainId = await signer.getChainId();
    execSync(
        `node ./packages/contracts/codegen-chain-specific-contracts.js ${chainId} ${factory.address} ${kpiTokensManager.address} ${predictedTemplateId}`
    );
    execSync("yarn build:contracts");

    // deploy creation proxy
    const {
        abi: creationProxyAbi,
        bytecode: creationProxyBytecode,
    } = require(`../artifacts/CreationProxy${chainId}.sol/CreationProxy.json`);
    const creationProxyFactory = new ContractFactory(
        creationProxyAbi,
        creationProxyBytecode,
        signer
    );
    const creationProxy = await creationProxyFactory.deploy();
    await creationProxy.deployed();

    // deploy test erc20 tokens
    const {
        abi: erc20Abi,
        bytecode: erc20Bytecode,
    } = require("../artifacts/ERC20PresetMinterPauser.sol/ERC20PresetMinterPauser.json");
    const erc20Factory = new ContractFactory(erc20Abi, erc20Bytecode, signer);
    const testToken1Contract = await erc20Factory.deploy(
        "Test token 1",
        "TST1"
    );
    await testToken1Contract.deployed();
    const testToken2Contract = await erc20Factory.deploy(
        "Test token 2",
        "TST2"
    );
    await testToken2Contract.deployed();

    // mint some test erc20 tokens to signer
    await testToken1Contract.mint(signer.address, utils.parseUnits("100", 18));
    await testToken2Contract.mint(signer.address, utils.parseUnits("100", 18));

    return {
        templateContract,
        customContracts: [
            {
                name: "Creation proxy",
                address: creationProxy.address,
            },
            {
                name: "ERC20 1",
                address: testToken1Contract.address,
            },
            {
                name: "ERC20 2",
                address: testToken2Contract.address,
            },
        ],
        frontendGlobals: {
            CCT_CREATION_PROXY_ADDRESS: creationProxy.address,
            CCT_ERC20_1_ADDRESS: testToken1Contract.address,
            CCT_ERC20_2_ADDRESS: testToken2Contract.address,
        },
    };
};
