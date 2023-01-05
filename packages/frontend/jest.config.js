export default {
    testEnvironment: "jest-environment-jsdom",
    roots: ["<rootDir>/tests"],
    transform: {
        "^.+\\.(ts|tsx)?$": "ts-jest",
    },
    testRegex: "(.*|(test|spec))\\.tsx?$",
};
