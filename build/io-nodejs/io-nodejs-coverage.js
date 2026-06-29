if (typeof __coverage__ === "undefined") {
    __coverage__ = {};
}
if (!__coverage__["build/io-nodejs/io-nodejs.js"]) {
    __coverage__["build/io-nodejs/io-nodejs.js"] = {
        path: "build/io-nodejs/io-nodejs.js",
        s: {},
        b: {},
        f: {},
        fnMap: {},
        statementMap: {},
        branchMap: {},
        code: [
            "(function () { YUI.add('io-nodejs', function (Y, NAME) {",
            "    // Node.js override for IO; transport built on native fetch.",
            "    var codes = require('http').STATUS_CODES;",
            "    if (!Y.IO.request) { Y.IO.request = function (rconf, cb) { /* fetch shim */ }; }",
            '}, \'@VERSION@\', {"requires": ["io-base"]});',
            "}());"
        ]
    };
}
YUI.add(
    "io-nodejs",
    function (Y, NAME) {
        var codes = require("http").STATUS_CODES;
        Y.IO.request ||
            (Y.IO.request = function (rconf, cb) {
                var opts = {
                    method: rconf.method || "GET",
                    headers: rconf.headers || {}
                };
                rconf.body && (opts.body = rconf.body);
                rconf.timeout &&
                    (opts.signal = AbortSignal.timeout(rconf.timeout));
                fetch(rconf.uri, opts)
                    .then(function (res) {
                        return res.text().then(function (text) {
                            var h = {};
                            res.headers.forEach(function (v, n) {
                                h[n] = v;
                            });
                            cb(null, {
                                statusCode: res.status,
                                headers: h,
                                body: text
                            });
                        });
                    })
                    .catch(function (err) {
                        err &&
                            err.name === "TimeoutError" &&
                            (err.code = "ETIMEDOUT");
                        cb(err);
                    });
            });
        var flatten = function (o) {
            var s = [];
            Object.keys(o).forEach(function (n) {
                s.push(n + ": " + o[n]);
            });
            return s.join("\n");
        };
        Y.IO.transports.nodejs = function () {
            return {
                send: function (transaction, uri, config) {
                    config.notify("start", transaction, config);
                    config.method = config.method || "GET";
                    config.method = config.method.toUpperCase();
                    var rconf = { method: config.method, uri: uri };
                    config.data &&
                        (Y.Lang.isString(config.data) &&
                            (rconf.body = config.data),
                        rconf.body &&
                            rconf.method === "GET" &&
                            ((rconf.uri +=
                                (rconf.uri.indexOf("?") > -1 ? "&" : "?") +
                                rconf.body),
                            (rconf.body = "")));
                    config.headers && (rconf.headers = config.headers);
                    config.timeout && (rconf.timeout = config.timeout);
                    config.request && Y.mix(rconf, config.request);
                    Y.IO.request(rconf, function (err, data) {
                        if (err) {
                            transaction.c = err;
                            config.notify(
                                err.code === "ETIMEDOUT"
                                    ? "timeout"
                                    : "failure",
                                transaction,
                                config
                            );
                            return;
                        }
                        data &&
                            (transaction.c = {
                                status: data.statusCode,
                                statusCode: data.statusCode,
                                statusText: codes[data.statusCode],
                                headers: data.headers,
                                responseText: data.body || "",
                                responseXML: null,
                                getResponseHeader: function (n) {
                                    return this.headers[n];
                                },
                                getAllResponseHeaders: function () {
                                    return flatten(this.headers);
                                }
                            });
                        config.notify("complete", transaction, config);
                        config.notify(
                            data &&
                                data.statusCode >= 200 &&
                                data.statusCode <= 299
                                ? "success"
                                : "failure",
                            transaction,
                            config
                        );
                    });
                    return { io: transaction };
                }
            };
        };
        Y.IO.defaultTransport("nodejs");
    },
    "@VERSION@",
    { requires: ["io-base"] }
);
