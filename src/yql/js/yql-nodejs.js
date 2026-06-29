/**
 * NodeJS plugin for YQL to use native fetch to make requests instead of JSONP.
 * Not required by the user, it's conditionally loaded and should "just work".
 * @module yql
 * @submodule yql-nodejs
 */

//Over writes Y.YQLRequest._send to use native fetch instead of JSONP
Y.YQLRequest.prototype._send = function (url, o) {
    fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(o.timeout || 30 * 1000)
    })
        .then(function (res) {
            return res.text();
        })
        .then(function (body) {
            o.on.success(JSON.parse(body));
        })
        .catch(function (err) {
            //The signature that YQL requires
            o.on.success({
                error: err
            });
        });
};
