if (typeof __coverage__ === "undefined") {
    __coverage__ = {};
}
if (!__coverage__["build/get-nodejs/get-nodejs.js"]) {
    __coverage__["build/get-nodejs/get-nodejs.js"] = {
        path: "build/get-nodejs/get-nodejs.js",
        s: {},
        b: {},
        f: {},
        fnMap: {},
        statementMap: {},
        branchMap: {},
        code: [
            "(function () { YUI.add('get', function (Y, NAME) {",
            "    // NodeJS Get module: loads local files via fs and remote modules via native fetch.",
            "    var Module=require('module'),path=require('path'),fs=require('fs');",
            "    Y.Get._include=function(url,cb){ /* fetch shim */ };",
            "}, '@VERSION@'); }());"
        ]
    };
}
YUI.add(
    "get",
    function (Y, NAME) {
        var Module = require("module"),
            path = require("path"),
            fs = require("fs"),
            end = function (cb, msg, result) {
                Y.Lang.isFunction(cb.onEnd) && cb.onEnd.call(Y, msg, result);
            },
            pass = function (cb) {
                (Y.Lang.isFunction(cb.onSuccess) && cb.onSuccess.call(Y, cb),
                    end(cb, "success", "success"));
            },
            fail = function (cb, er) {
                ((er.errors = [er]),
                    Y.Lang.isFunction(cb.onFailure) &&
                        cb.onFailure.call(Y, er, cb),
                    end(cb, er, "fail"));
            };
        ((Y.Get = function () {}),
            (Y.config.base = path.join(__dirname, "../")),
            (YUI.require = require),
            (YUI.process = process),
            (Y.Get._exec = function (data, url, cb) {
                data.charCodeAt(0) === 65279 && (data = data.slice(1));
                var mod = new Module(url, module);
                ((mod.filename = url),
                    (mod.paths = Module._nodeModulePaths(path.dirname(url))),
                    typeof YUI._getLoadHook == "function" &&
                        (data = YUI._getLoadHook(data, url)),
                    mod._compile(
                        "module.exports = function (YUI) {return (function () {" +
                            data +
                            "\n;return YUI;}).apply(global);};",
                        url
                    ),
                    (YUI = mod.exports(YUI)),
                    (mod.loaded = !0),
                    cb(null, url));
            }),
            (Y.Get._include = function (url, cb) {
                var mod,
                    self = this;
                if (url.match(/^https?:\/\//))
                    fetch(url, {
                        signal: self.timeout
                            ? AbortSignal.timeout(self.timeout)
                            : undefined
                    })
                        .then(function (res) {
                            return res.text();
                        })
                        .then(function (body) {
                            Y.Get._exec(body, url, cb);
                        })
                        .catch(function (err) {
                            (Y.log(err, "error", "get"), cb(err, url));
                        });
                else {
                    try {
                        url = Module._findPath(
                            url,
                            Module._resolveLookupPaths(
                                url,
                                module.parent.parent
                            )[1]
                        );
                        if (!Y.config.useSync) {
                            fs.readFile(url, "utf8", function (err, mod) {
                                err ? cb(err, url) : Y.Get._exec(mod, url, cb);
                            });
                            return;
                        }
                        mod = fs.readFileSync(url, "utf8");
                    } catch (err) {
                        cb(err, url);
                        return;
                    }
                    Y.Get._exec(mod, url, cb);
                }
            }),
            (Y.Get.js = function (s, options) {
                var urls = Y.Array(s),
                    url,
                    i,
                    l = urls.length,
                    c = 0,
                    check = function () {
                        c === l && pass(options);
                    };
                for (i = 0; i < l; i++)
                    ((url = urls[i]),
                        Y.Lang.isObject(url) && (url = url.url),
                        (url = url.replace(/'/g, "%27")),
                        Y.Get._include(url, function (err, url) {
                            (Y.config || (Y.config = { debug: !0 }),
                                options.onProgress &&
                                    options.onProgress.call(
                                        options.context || Y,
                                        url
                                    ),
                                err ? fail(options, err) : (c++, check()));
                        }));
                return { execute: function () {} };
            }),
            (Y.Get.script = Y.Get.js),
            (Y.Get.css = function (s, cb) {
                pass(cb);
            }));
    },
    "@VERSION@"
);
