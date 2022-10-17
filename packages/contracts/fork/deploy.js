import ethers from "ethers";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const { ContractFactory } = ethers;
const require = createRequire(fileURLToPath(import.meta.url));

export const deploy = async (
    factory,
    kpiTokensManager,
    _oraclesManager,
    _multicall,
    predictedTemplateId,
    signer
) => {
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

    const {
        abi: creationProxyAbi,
        bytecode: creationProxyBytecode,
    } = require("../artifacts/CreationProxy.sol/CreationProxy.json");
    const creationProxyFactory = new ContractFactory(
        creationProxyAbi,
        creationProxyBytecode,
        signer
    );
    const creationProxy = await creationProxyFactory.deploy(
        factory.address,
        kpiTokensManager.address,
        predictedTemplateId
    );
    await creationProxy.deployed();

    return {
        templateContract,
        customContracts: [
            {
                name: "Creation proxy",
                address: creationProxy.address,
            },
        ],
    };
};
