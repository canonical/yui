import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 60_000,
    use: { baseURL: "http://localhost:8748" },
    // Static-serve the repo so legacy .html harnesses load build/yui exactly as
    // upstream/Launchpad's combo loader does. Reuses 8748 across both projects.
    webServer: {
        command: "npx http-server -p 8748 -c-1 .",
        port: 8748,
        reuseExistingServer: !process.env.CI
    },
    projects: [
        {
            name: "browser",
            testDir: "./tests/browser",
            use: { ...devices["Desktop Chrome"] }
        },
        {
            name: "legacy",
            testDir: "./tests/legacy",
            use: { ...devices["Desktop Chrome"] }
        }
    ]
});
