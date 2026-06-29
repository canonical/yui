// Stage the npm package so its root mirrors the historical `yui` package layout:
// every module sits at the tarball root (e.g. `yui/yui-min.js`, `node-base/...`),
// with NO `build/` prefix. Launchpad's combo loader and combo.scss depend on this
// contract (see AGENTS.md / packaging notes).
//
// `build/` is hand-synced and committed in this fork (the grunt/yogi/shifter
// toolchain is retired), so there is no build step here: we stage straight from
// the committed `build/` output.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "build");
const out = path.join(root, "npm-dist");

if (!fs.existsSync(buildDir)) {
    console.error(`error: ${buildDir} not found; nothing to stage.`);
    process.exit(1);
}

// Fresh staging dir.
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// build/* becomes the package root.
fs.cpSync(buildDir, out, { recursive: true });

// Trim artifacts that should never ship:
//  - *-coverage.js  (instrumented copies; matched the legacy .npmignore)
//  - *.swf          (Flash; Launchpad strips these — keep that a no-op)
let removedCoverage = 0;
let removedSwf = 0;
const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(p);
        } else if (entry.name.endsWith("-coverage.js")) {
            fs.rmSync(p);
            removedCoverage++;
        } else if (entry.name.endsWith(".swf")) {
            fs.rmSync(p);
            removedSwf++;
        }
    }
};
walk(out);

// Node entry point at the flattened root. Mirrors the repo's index.js but with the
// `build/` prefix dropped, so `require("@canonical/yui")` still yields `{ YUI }`.
fs.writeFileSync(
    path.join(out, "index.js"),
    "// CommonJS entry point. Mirrors the historical `yui` npm package: requiring\n" +
        "// the package yields the Node seed which exports `{ YUI }`.\n" +
        'module.exports = require("./yui-nodejs/yui-nodejs.js");\n',
);

// Trimmed manifest at the new root.
const pkg = require(path.join(root, "package.json"));
delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.directories;
pkg.main = "index.js"; // resolves to ./yui-nodejs/yui-nodejs.js at the flat root
fs.writeFileSync(
    path.join(out, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
);

// Carry over the docs/license.
for (const f of ["README.md", "LICENSE.md", "HISTORY.md"]) {
    const src = path.join(root, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, f));
}

console.log(
    `staged npm-dist (root = build output); removed ${removedCoverage} ` +
        `coverage file(s), ${removedSwf} swf file(s).`,
);
