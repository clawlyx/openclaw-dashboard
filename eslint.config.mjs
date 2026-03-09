import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "coverage/**"]
  },
  ...nextCoreWebVitals
];

export default config;
