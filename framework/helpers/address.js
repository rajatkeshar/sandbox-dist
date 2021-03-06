"use strict";
var crypto = require("crypto"),
    base58check = require("./base58check"),
    constants = require('./constants'),
    NORMAL_PREFIX = constants.addressPrefix // E

module.exports = {
    isAddress: function(e) {
        if ("string" != typeof e) return !1;
        if (!/^[0-9]{1,20}$/g.test(e)) {
            if (!base58check.decodeUnsafe(e.slice(1))) return !1;
            if (-1 == NORMAL_PREFIX.indexOf(e[0])) return !1
        }
        return !0
    },
    generateBase58CheckAddress: function(e) {
        "string" == typeof e && (e = Buffer.from(e, "hex"));
        var r = crypto.createHash("sha256").update(e).digest(),
            t = crypto.createHash("ripemd160").update(r).digest();
        return NORMAL_PREFIX + base58check.encode(t)
    }
};
