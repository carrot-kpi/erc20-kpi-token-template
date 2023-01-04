import { ReactElement, useEffect, useState } from "react";
import { Address, erc20ABI, useAccount, useContractReads } from "wagmi";
import { CollateralApproval } from "../collateral-approval";
import { CollateralData } from "../../types";
import { BigNumber, constants } from "ethers";
import { Button } from "@carrot-kpi/ui";

interface OnchainPreparationsProps {
    collaterals: CollateralData[];
    creationProxyAddress: Address;
    onCreate: () => void;
}

interface ApprovalStatusMap {
    [key: Address]: boolean;
}

export const OnchainPreparations = ({
    collaterals,
    creationProxyAddress,
    onCreate,
}: OnchainPreparationsProps): ReactElement => {
    const { address } = useAccount();
    const { data } = useContractReads({
        contracts: collaterals.map((collateral) => {
            return {
                address: collateral.address,
                abi: erc20ABI,
                functionName: "allowance",
                args: [address ?? constants.AddressZero, creationProxyAddress],
            };
        }),
        watch: true,
    });

    const [approved, setApproved] = useState<ApprovalStatusMap>({});
    const [allApproved, setAllApproved] = useState(false);

    useEffect(() => {
        setApproved(
            collaterals.reduce(
                (accumulator: ApprovalStatusMap, collateral, index) => {
                    if (!data || data.length === 0 || !data[index]) {
                        accumulator[collateral.address] = false;
                        return accumulator;
                    }
                    accumulator[collateral.address] = (
                        data[index] as unknown as BigNumber
                    ).gte(collateral.amount);
                    return accumulator;
                },
                {}
            )
        );
    }, [collaterals, data]);

    useEffect(() => {
        const values = Object.values(approved);
        if (values.length === 0) return;
        for (const approval of values) {
            if (!approval) {
                setAllApproved(false);
                return;
            }
        }
        setAllApproved(true);
    }, [approved]);

    return (
        <>
            {collaterals.map((collateral) => {
                return (
                    <CollateralApproval
                        key={collateral.address}
                        disabled={approved[collateral.address]}
                        collateral={collateral}
                        spender={creationProxyAddress}
                    />
                );
            })}
            <Button size="small" onClick={onCreate} disabled={!allApproved}>
                Create
            </Button>
        </>
    );
};
