import { DEFAULT_OUTCOME_CONFIGURATION } from "../constants";
import type { OracleData, OutcomeConfigurationState } from "../types";

export const outcomeConfigurationFromOracleData = (
    templateId: number,
    oracleData: OracleData
): OutcomeConfigurationState => {
    switch (templateId) {
        // reality.eth oracle template
        case 1: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const usedRealityTemplate = (oracleData.state as any)
                .realityTemplateId as number;
            return usedRealityTemplate === 0
                ? {
                      automaticallyFilled: true,
                      binary: true,
                      lowerBound: {
                          value: "0",
                          formattedValue: "",
                      },
                      higherBound: {
                          value: "1",
                          formattedValue: "",
                      },
                  }
                : DEFAULT_OUTCOME_CONFIGURATION;
        }
        default: {
            return DEFAULT_OUTCOME_CONFIGURATION;
        }
    }
};
