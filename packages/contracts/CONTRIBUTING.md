# Contributing

The ERC20 KPI token template contracts are developed using Foundry, so in order
to contribute you need to first install Foundry locally. Check out
[this link](https://getfoundry.sh/) to easily install Foundry on your machine.
Make sure you periodically update Foundry to the latest version.

Foundry manages dependencies using git submodules, so it's advised to use
`git clone --recurse-submodules` when cloning the repo in order to have a
ready-to-go environment. If `git clone` was used without the
`--recurse-submodules` flag, you can just run
`git submodule update --init --recursive` in the cloned repo in order to easily
install the dependencies.

After having done the above, the environment should be ready to work with.

## Profiles

Profiles can be used in Foundry to specify different build configurations to
fine-tune the development process. Here we use 2 profiles:

- `test`: This profile pretty much skips all the optimizations and focuses on
  raw speed. As the name suggests, this is used to run all the available tests
  in a quick way, and without useless optimization.
- `production`: The production profile must be used when deploying contracts in
  production. This profile achieves a good level of optimization and also
  focuses on the production contracts, skipping compilation of the tests
  entirely. Depending on your machine, building with this profile can take some
  time.

All the profiles above are specified in the `foundry.toml` file at the root of
the project.

## Testing

Tests are written in Solidity and you can find them in the `tests` folder. Both
property-based fuzzing and standard unit tests are easily supported through the
use of Foundry.

In order to launch tests you can both use Forge commands directly or npm
scripts.

## Github Actions

The repository uses GH actions to setup CI to automatically run all the
available
[tests](https://github.com/carrot-kpi/contracts/blob/feature/v1-no-automation/.github/workflows/ci.yaml)
on each push.

## Pre-commit hooks

In order to reduce the ability to make mistakes to the minimum, pre-commit hooks
are enabled to both run all the available tests (through the same command used
in the GH actions) and to lint the commit message through `husky` and
`@commitlint/config-conventional`. Please have a look at the supported formats
by checking
[this](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
out.

### Deploying

In order to deploy the template contract to a given network you can go ahead and
create a .env.<NETWORK_NAME> file exporting 2 env variables:

```
export PRIVATE_KEY=""
export RPC_ENDPOINT=""
export ETHERSCAN_API_KEY=""
export VERIFIER_URL=""
export FEE=""
```

brief explainer of the env variables:

- `PRIVATE_KEY`: the private key related to the account that will perform the
  deployment.
- `RPC_ENDPOINT`: the RPC endpoint that will be used to broadcast transactions.
  This will also determine the network where the deployment will happen.
- `ETHERSCAN_API_KEY`: the Etherscan (or Blockscout) API key used to verify
  contracts.
- `VERIFIER_URL`: the Etherscan pr Blockscout API URL that will be used to
  verify contracts.
- `FEE`: the fee percentage (in parts per million) that will be deducted from
  the given rewards.

Once you have one instance of this file for each network you're interested in
(e.g. .`env.goerli`, `.env.gnosis`, `env.mainnet` etc etc), you can go ahead and
locally load the env variables by executing `source .env.<NETWORK_NAME>`. After
doing that, you can finally execute the following command to initiate the
deployment:

```
FOUNDRY_PROFILE=production forge script --broadcast --slow --private-key $PRIVATE_KEY --fork-url $RPC_ENDPOINT --verify Deploy $FEE
```
