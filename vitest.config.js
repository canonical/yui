import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Browser/Playwright specs live under tests/browser and run separately.
        include: ["tests/node/**/*.test.js"],
        exclude: ["tests/browser/**", "node_modules/**", "build/**", "src/**"],
        environment: "node",
        globals: true
    }
});
