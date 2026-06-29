YUI.add(
    "yql-nodejs",
    function (e, t) {
        e.YQLRequest.prototype._send = function (e, t) {
            fetch(e, {
                method: "GET",
                signal: AbortSignal.timeout(t.timeout || 3e4)
            })
                .then(function (e) {
                    return e.text();
                })
                .then(function (e) {
                    t.on.success(JSON.parse(e));
                })
                .catch(function (e) {
                    t.on.success({ error: e });
                });
        };
    },
    "@VERSION@",
    { requires: ["yql"] }
);
