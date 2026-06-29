YUI.add(
    "io-nodejs",
    function (e, t) {
        e.IO.request ||
            (e.IO.request = function (e, t) {
                var n = {
                    method: e.method || "GET",
                    headers: e.headers || {}
                };
                (e.body && (n.body = e.body),
                    e.timeout && (n.signal = AbortSignal.timeout(e.timeout)),
                    fetch(e.uri, n)
                        .then(function (e) {
                            return e.text().then(function (n) {
                                var r = {};
                                (e.headers.forEach(function (e, t) {
                                    r[t] = e;
                                }),
                                    t(null, {
                                        statusCode: e.status,
                                        headers: r,
                                        body: n
                                    }));
                            });
                        })
                        .catch(function (e) {
                            (e &&
                                e.name === "TimeoutError" &&
                                (e.code = "ETIMEDOUT"),
                                t(e));
                        }));
            });
        var n = require("http").STATUS_CODES,
            r = function (e) {
                var t = [];
                return (
                    Object.keys(e).forEach(function (n) {
                        t.push(n + ": " + e[n]);
                    }),
                    t.join("\n")
                );
            };
        ((e.IO.transports.nodejs = function () {
            return {
                send: function (t, i, s) {
                    (s.notify("start", t, s),
                        (s.method = s.method || "GET"),
                        (s.method = s.method.toUpperCase()));
                    var o = { method: s.method, uri: i };
                    (s.data &&
                        (e.Lang.isString(s.data) && (o.body = s.data),
                        o.body &&
                            o.method === "GET" &&
                            ((o.uri +=
                                (o.uri.indexOf("?") > -1 ? "&" : "?") +
                                o.body),
                            (o.body = ""))),
                        s.headers && (o.headers = s.headers),
                        s.timeout && (o.timeout = s.timeout),
                        s.request && e.mix(o, s.request),
                        e.IO.request(o, function (e, i) {
                            if (e) {
                                ((t.c = e),
                                    s.notify(
                                        e.code === "ETIMEDOUT"
                                            ? "timeout"
                                            : "failure",
                                        t,
                                        s
                                    ));
                                return;
                            }
                            (i &&
                                (t.c = {
                                    status: i.statusCode,
                                    statusCode: i.statusCode,
                                    statusText: n[i.statusCode],
                                    headers: i.headers,
                                    responseText: i.body || "",
                                    responseXML: null,
                                    getResponseHeader: function (e) {
                                        return this.headers[e];
                                    },
                                    getAllResponseHeaders: function () {
                                        return r(this.headers);
                                    }
                                }),
                                s.notify("complete", t, s),
                                s.notify(
                                    i &&
                                        i.statusCode >= 200 &&
                                        i.statusCode <= 299
                                        ? "success"
                                        : "failure",
                                    t,
                                    s
                                ));
                        }));
                    var u = { io: t };
                    return u;
                }
            };
        }),
            e.IO.defaultTransport("nodejs"));
    },
    "@VERSION@",
    { requires: ["io-base"] }
);
