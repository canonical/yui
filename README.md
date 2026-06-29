@canonical/yui
==============

A Canonical-maintained security fork of the archived [YUI 3][yui] JavaScript and
CSS framework. The upstream project was archived in August 2014; this fork exists
to provide ongoing **security support** for downstream consumers such as
[Launchpad](https://launchpad.net/).

Scope is deliberately narrow: security fixes and the minimal modernization needed
to keep them shippable. New features and general bug fixes are out of scope.

Install
-------

```sh
npm install @canonical/yui
```

The published package mirrors the historical `yui` layout: every module sits at
the package root (e.g. `yui/yui-min.js`, `loader/loader-min.js`,
`cssreset/cssreset.css`), so it is a drop-in replacement for consumers that load
modules by root-relative path.

Documentation
-------------

The library's API and component documentation remains available at the official
YUI site:

  * [YUI Documentation](https://clarle.github.io/yui3/) (mirror of yuilibrary.com)

Note that upstream documentation describes the original library; behavior specific
to this fork (e.g. the native-`fetch` Node transports) is documented in
[`BUILD.md`](BUILD.md).

Source layout
-------------

  * `src/` — raw, unbuilt source (JavaScript, CSS, assets) plus the frozen
    upstream test harnesses. All source changes happen here.
  * `build/` — built artifacts (raw, `-debug`, and `-min`). These are committed
    and hand-synced with `src/`; there is no build step on install. See
    [`BUILD.md`](BUILD.md).

Development
-----------

  * Contributor and security-fork guidance: [`AGENTS.md`](AGENTS.md).
  * Build and packaging details: [`BUILD.md`](BUILD.md).
  * Tests run on Vitest (Node) and Playwright (browser/legacy); see `BUILD.md`.

License
-------

Distributed under the BSD 3-Clause License. See [`LICENSE.md`](LICENSE.md).

[yui]: https://github.com/yui/yui3
