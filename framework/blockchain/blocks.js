"use strict";
var _setImmediate2 = require("babel-runtime/core-js/set-immediate"),
    _setImmediate3 = _interopRequireDefault(_setImmediate2),
    _keys = require("babel-runtime/core-js/object/keys"),
    _keys2 = _interopRequireDefault(_keys),
    _map = require("babel-runtime/core-js/map"),
    _map2 = _interopRequireDefault(_map),
    _getIterator2 = require("babel-runtime/core-js/get-iterator"),
    _getIterator3 = _interopRequireDefault(_getIterator2),
    _regenerator = require("babel-runtime/regenerator"),
    _regenerator2 = _interopRequireDefault(_regenerator),
    _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator"),
    _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var dbLite = require('../helpers/dblite');

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        default: e
    }
}
var crypto = require("crypto"),
    path = require("path"),
    async = require("async"), extend = require("extend"), bignum = require("bignumber"), slots = require("../helpers/slots.js"), private_ = {}, self = null, library = null, modules = null;

function Blocks(e, t) {
    self = this, library = t;
    try {
        private_.genesisBlock = require(path.join(app.rootDir, "genesis.json"))
    } catch (e) {
        return app.logger.error("Failed to load genesis.json"), void process.exit(3)
    }
    private_.lastBlock = private_.genesisBlock, e(null, self)
}
private_.lastBlock = null, private_.genesisBlock = null, private_.loaded = !1, private_.blockCache = {}, private_.proposeCache = {}, private_.lastPropose = null, private_.lastVoteTime = null, private_.deleteBlock = function(e, t) {
    modules.api.sql.remove({
        table: "blocks",
        condition: {
            id: e
        }
    }, t)
}, private_.popLastBlock = function(e, t) {
    if (!e.prevBlockId) return t("Can't remove genesis block");
    self.getBlock(function(r, o) {
        if (r || !o) return t(r || "Previous block is null");
        o = self.readDbRows(o);
        var a = 0;
        async.eachSeries(e.transactions.reverse(), function(e, t) {
            async.series([function(t) {
                a += e.fee, modules.blockchain.transactions.undo(e, t)
            }, function(t) {
                modules.blockchain.transactions.undoUnconfirmed(e, t)
            }], t)
        }, function(r) {
            r && (app.logger.error(r), process.exit(0)), modules.blockchain.accounts.undoMerging({
                publicKey: e.delegate,
                balance: {
                    DEFAULT: a
                }
            }, function(r) {
                private_.deleteBlock(e.id, function(e) {
                    if (e) return t(e);
                    t(null, o[0])
                })
            })
        })
    }, {
        id: e.prevBlockId
    })
}, private_.verify = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t) {
        var r, o, a, n, s;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    if (app.logger.trace("enter Blocks#verify"), t) {
                        e.next = 4;
                        break
                    }
                    return app.logger.error("verify block undefined"), e.abrupt("return");
                case 4:
                    // console.log("verify: verifyBlockId case4");
                    if (e.prev = 4, modules.logic.block.verifyId(t)) {
                        e.next = 7;
                        break
                    }
                    throw new Error("Invalid block id");
                case 7:
                    // console.log("verify: case7");
                    e.next = 12;
                    break;
                case 9:
                    throw e.prev = 9, e.t0 = e.catch(4), new Error("Failed to verify block id: " + e.t0);
                case 12:
                    // console.log("verify: verifyBlockSignature case12");
                    if (e.prev = 12, modules.logic.block.verifySignature(t)) {
                        e.next = 15;
                        break
                    }
                    throw new Error("Invalid block signature");
                case 15:
                    // console.log("verify: case15");
                    e.next = 20;
                    break;
                case 17:
                    throw e.prev = 17, e.t1 = e.catch(12), new Error("Failed to verify signature: " + e.t1);
                case 20:
                    if (!t.delegates) {
                        e.next = 22;
                        break
                    }
                    throw new Error("Invalid delegates in block");
                case 22:
                    // console.log("verify: case22 t.id private_.genesisBlock.id: ", t.id, private_.genesisBlock.id);
                    if ((t.id === private_.genesisBlock.id)) {
                        // console.log("111111111111111111111111111111111111111111");
                        e.next = 27;
                        break
                    }
                    // console.log("commingBlock t: ", t);
                    // console.log("private.lastBlock: ", private_.lastBlock);
                    // console.log("t.prevBlockId, private_.lastBlock.id: ",t.prevBlockId, private_.lastBlock.id);
                    if (t.prevBlockId == private_.lastBlock.id) {
                        // console.log("22222222222222222222222222222222222222222222");
                        e.next = 25;
                        break
                    }
                    throw new Error("Invalid previous block");
                case 25:
                    // console.log("verify: case25");
                    if (!(t.timestamp <= private_.lastBlock.timestamp || t.timestamp > slots.getNow())) {
                        e.next = 27;
                        break
                    }
                    throw new Error("Invalid timestamp");
                case 27:
                    // console.log("verify: case27");
                    if (!(t.payloadLength > 1048576)) {
                        e.next = 29;
                        break
                    }
                    throw new Error("Invalid payload length");
                case 29:
                    if (e.prev = 29, 32 == new Buffer(t.payloadHash, "hex").length) {
                        e.next = 33;
                        break
                    }
                    throw new Error("Invalid payload hash");
                case 33:
                    e.next = 38;
                    break;
                case 35:
                    throw e.prev = 35, e.t2 = e.catch(29), new Error("Invalid payload hash");
                case 38:
                    app.logger.trace("before verify transaction signature"), r = crypto.createHash("sha256"), o = 0, e.prev = 41, e.t3 = _regenerator2.default.keys(t.transactions);
                case 43:
                    if ((e.t4 = e.t3()).done) {
                        e.next = 54;
                        break
                    }
                    if (a = e.t4.value, n = t.transactions[a], s = modules.logic.transaction.getBytes(n, !0), r.update(s), o += s.length, modules.logic.transaction.verifyBytes(n.senderPublicKey, n.signature, s)) {
                        e.next = 52;
                        break
                    }
                    throw new Error("Invalid transaction signature");
                case 52:
                    e.next = 43;
                    break;
                case 54:
                    e.next = 59;
                    break;
                case 56:
                    // console.log("vefify: Failed to verify transaction: case56");
                    throw e.prev = 56, e.t5 = e.catch(41), new Error("Failed to verify transaction: " + e.t5);
                case 59:
                    if (app.logger.trace("after verify transaction signature"), r = r.digest(), o == t.payloadLength) {
                        e.next = 63;
                        break
                    }
                    throw new Error("Payload length is incorrect");
                case 63:
                    if (r.toString("hex") == t.payloadHash) {
                        e.next = 65;
                        break
                    }
                    throw new Error("Payload hash is incorrect");
                case 65:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [4, 9],
            [12, 17],
            [29, 35],
            [41, 56]
        ])
    }));
    return function(t) {
        return e.apply(this, arguments)
    }
}(), private_.getIdSequence = function(e, t) {
    var r = this;
    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
        var a, n;
        return _regenerator2.default.wrap(function(r) {
            for (;;) switch (r.prev = r.next) {
                case 0:
                    return r.prev = 0, r.next = 3, app.model.Block.findAll({
                        fields: ["id", "height"],
                        condition: {
                            height: {
                                $lte: e
                            }
                        },
                        sort: {
                            height: -1
                        },
                        limit: 5
                    });
                case 3:
                    return a = r.sent, n = a.map(function(e) {
                        return e.id
                    }), r.abrupt("return", t(null, {
                        ids: n,
                        firstHeight: a[0].height
                    }));
                case 8:
                    r.prev = 8, r.t0 = r.catch(0), t(r.t0);
                case 11:
                case "end":
                    return r.stop()
            }
        }, o, r, [
            [0, 8]
        ])
    }))()
}, private_.rollbackUntilBlock = function(e, t) {
    modules.api.sql.select({
        table: "blocks",
        condition: {
            pointId: e.pointId,
            pointHeight: e.pointHeight
        },
        fields: ["id", "height"]
    }, {
        id: String,
        height: Number
    }, function(e, r) {
        !e && r.length ? (app.logger.info("Blocks#rollbackUntilBlock", r), self.deleteBlocksBefore(r[0], t)) : t()
    })
}, private_.verifyVotes = function(e) {
    app.logger.trace("enter Blocks#verifyVotes");
    var t = modules.blockchain.round.getDelegatePublicKeys(),
        r = {};
    t.forEach(function(e) {
        r[e] = !0
    });
    for (var o = 0; o < e.signatures.length; ++o) {
        var a = e.signatures[o];
        if (!r[a.key]) return app.logger.warn("Votes key is not in the top list: " + a.key), !1;
        if (!modules.logic.consensus.verifyVote(e.height, e.id, a)) return app.logger.warn("Failed to verify vote"), !1
    }
    return !0
}, Blocks.prototype.processFee = function(e) {
    if (e && e.transactions) {
        var t = !0,
            r = !1,
            o = void 0;
        try {
            for (var a, n = (0, _getIterator3.default)(e.transactions); !(t = (a = n.next()).done); t = !0) {
                var s = a.value,
                    i = app.getFee(s.type) || app.defaultFee;
                app.feePool.add(i.currency, s.fee)
            }
        } catch (e) {
            r = !0, o = e
        } finally {
            try {
                !t && n.return && n.return()
            } finally {
                if (r) throw o
            }
        }
    }
}, Blocks.prototype.processBlock = function() {
    var r = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t, r) {
        var o, a;
        return _regenerator2.default.wrap(function(e) {
            // console.log("calling processBlock");
            for (;;) switch (e.prev = e.next) {
                case 0:
                    if (app.logger.debug("processBlock block and options", t, r), r.local) {
                        e.next = 31;
                        break
                    }
                    if (e.prev = 2, modules.logic.block.normalize(t), !r.votes) {
                        // console.log("normlization true case0");
                        e.next = 14;
                        break
                    }
                    if (o = r.votes, t.height == o.height) {
                        e.next = 8;
                        break
                    }
                    throw new Error("Votes height is not correct");
                case 8:
                    if (t.id == o.id) {
                        e.next = 10;
                        break
                    }
                    throw new Error("Votes id is not correct");
                case 10:
                    if (o.signatures && modules.logic.consensus.hasEnoughVotesRemote(o)) {
                        e.next = 12;
                        break
                    }
                    throw new Error("Votes signature is not enough");
                case 12:
                    if (private_.verifyVotes(r.votes)) {
                        e.next = 14;
                        break
                    }
                    throw new Error("Failed to verify votes");
                case 14:
                    // // console.log("processBlocks case14");
                    for (a in t.transactions) modules.logic.transaction.normalize(t.transactions[a]);
                    e.next = 21;
                    break;
                case 17:
                    throw e.prev = 17, e.t0 = e.catch(2), app.logger.error("Failed to verify remote block: " + e.t0), e.t0;
                case 21:
                    // console.log("processBlock case21");
                    return app.logger.trace("before applyBlock"), e.prev = 22, e.next = 25, self.applyBlock(t, r);
                case 25:
                    // console.log("processBlock case25");
                    e.next = 31;
                    break;
                case 27:
                // console.log("processBlock Failed to apply remote block case27");
                    throw e.prev = 27, e.t1 = e.catch(22), app.logger.error("Failed to apply remote block: " + e.t1), e.t1;
                case 31:
                    // console.log("processBlock case31");
                    return e.prev = 31, e.next = 34, private_.verify(t);
                case 34:
                    e.next = 40;
                    break;
                case 36:
                    // console.log("processBlock Failed to verify block case36");
                    throw e.prev = 36, e.t2 = e.catch(31), app.logger.error("Failed to verify block: " + e.t2), e.t2;
                case 40:
                    // console.log("processBlock: saveBlock case40");
                    return e.prev = 40, self.processFee(t), self.saveBlock(t), e.next = 45, self.applyRound(t);
                case 45:
                    // console.log("processBlock commitBlock case45");
                    return e.next = 47, app.sdb.commitBlock({
                        noTransaction: !!r.noTransaction
                    });
                case 47:
                    // console.log("processBlock case47");
                    e.next = 54;
                    break;
                case 49:
                    // console.log("processBlock: save block error: case49");
                    throw e.prev = 49, e.t3 = e.catch(40), app.logger.error("save block error: ", e.t3), app.sdb.rollbackBlock(), new Error("Failed to save block: " + e.t3);
                case 54:
                    // console.log("processBlock Block applied correctly case54");
                    app.logger.info("Block applied correctly with " + t.count + " transactions"), self.setLastBlock(t), private_.blockCache = {}, private_.proposeCache = {}, private_.lastVoteTime = null, modules.logic.consensus.clearState(), r.broadcast && modules.api.transport.message("block", {
                        block: t,
                        votes: r.votes
                    });
                case 61:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [2, 17],
            [22, 27],
            [31, 36],
            [40, 49]
        ])
    }));
    return function(e, t) {
        return r.apply(this, arguments)
    }
}(), Blocks.prototype.applyRound = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t) {
        var r, o, a, n, s, i;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    if (r = app.meta.delegates, t.height % r.length == 0) {
                        e.next = 3;
                        break
                    }
                    return e.abrupt("return");
                case 3:
                    for (app.logger.debug("----------------------on round end-----------------------"), app.logger.debug("app.delegate.length", r.length), o = new _map2.default, a = new _map2.default, n = app.feePool.getFees(), app.logger.debug("round fees", n), n.forEach(function(e, t) {
                            var n = bignum(e).div(r.length).floor();
                            o.set(t, n.toString());
                            var s = bignum(e).sub(n.mul(r.length));
                            s.gt(0) && a.set(t, s.toString())
                        }), app.logger.debug("fees distributes", o, a), s = function(e) {
                            var t = modules.blockchain.accounts.generateAddressByPublicKey(r[e]);
                            o.forEach(function(e, r) {
                                app.logger.debug("apply round distributing fee", t, r, e), app.balances.increase(t, r, e)
                            }), e === r.length - 1 && a.forEach(function(e, r) {
                                app.logger.debug("apply round distributing fee remain", t, r, e), app.balances.increase(t, r, e)
                            })
                        }, i = 0; i < r.length; ++i) s(i);
                case 13:
                case "end":
                    return e.stop()
            }
        }, e, this)
    }));
    return function(t) {
        return e.apply(this, arguments)
    }
}(), Blocks.prototype.setLastBlock = function(e) {
    app.logger.trace("Blocks#setLastBlock", e), private_.lastBlock = e;
    var t = app.meta.delegates.length,
        r = Math.floor(e.height / t) + (e.height % t > 0 ? 1 : 0);
    app.feePool.setRound(r)
}, Blocks.prototype.applyBatchBlock = function(e, t) {
    async.eachSeries(e, function(e, t) {
        modules.blockchain.blocks.applyBlock(e, t)
    }, t)
}, Blocks.prototype.saveBatchBlock = function(e, t) {
    for (var r = [], o = [], a = 0; a < e.length; a++) {
        r.push([e[a].id, e[a].timestamp, e[a].height, e[a].payloadLength, e[a].payloadHash, e[a].prevBlockId, e[a].pointId, e[a].pointHeight, e[a].delegate, e[a].signature, e[a].count]);
        for (var n = 0; n < e[a].transactions.length; n++) o.push([e[a].transactions[n].id, e[a].transactions[n].type, e[a].transactions[n].senderId, e[a].transactions[n].senderPublicKey, e[a].transactions[n].recipientId, e[a].transactions[n].amount, e[a].transactions[n].fee, e[a].transactions[n].timestamp, e[a].transactions[n].signature, e[a].transactions[n].blockId])
    }
    modules.api.sql.batch({
        table: "blocks",
        fields: ["id", "timestamp", "height", "payloadLength", "payloadHash", "prevBlockId", "pointId", "pointHeight", "delegate", "signature", "count"],
        values: r
    }, function(e) {
        if (e) return t(e);
        modules.api.sql.batch({
            table: "transactions",
            fields: ["id", "type", "senderId", "senderPublicKey", "recipientId", "amount", "fee", "timestamp", "signature", "blockId"],
            values: o
        }, t)
    })
}, Blocks.prototype.saveBlock = function(e) {
    // console.log("saveBlock: e: ", e);
    for (var t in app.logger.trace("Blocks#save height", e.height), e.transactions) {
        var r = e.transactions[t];
        r.height = e.height, app.sdb.create("Transaction", r)
    }
    var o = {};
    for (var a in e) "transactions" !== a && (o[a] = e[a]);
    app.sdb.create("Block", o), app.logger.trace("Blocks#save end")
}, Blocks.prototype.readDbRows = function(e) {
    for (var t = {}, r = [], o = 0, a = e.length; o < a; o++) {
        var n = modules.logic.block.dbRead(e[o]);
        if (n) {
            t[n.id] || (r.push(n.id), t[n.id] = n);
            var s = modules.logic.transaction.dbRead(e[o]);
            t[n.id].transactions = t[n.id].transactions || {}, s && (t[n.id].transactions[s.id] || (t[n.id].transactions[s.id] = s))
        }
    }
    return t = r.map(function(e) {
        return t[e].transactions = (0, _keys2.default)(t[e].transactions).map(function(r) {
            return t[e].transactions[r]
        }), t[e]
    })
}, Blocks.prototype.deleteBlocksBefore = function(e, t) {
    async.whilst(function() {
        return !(e.height >= private_.lastBlock.height)
    }, function(e) {
        app.logger.trace("Blocks#popLastBlock", private_.lastBlock.height), private_.popLastBlock(private_.lastBlock, function(t, r) {
            t || (private_.lastBlock = r), e(t)
        })
    }, function(e) {
        (0, _setImmediate3.default)(t, e)
    })
}, Blocks.prototype.simpleDeleteAfterBlock = function(e, t) {
    modules.api.sql.remove({
        table: "blocks",
        condition: {
            height: {
                $gte: e
            }
        }
    }, t);
}, Blocks.prototype.genesisBlock = function() {
    return private_.genesisBlock
}, Blocks.prototype.createBlock = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t, r, o, a) {
        var n, s, i, c, l, p, u, d, g, f, h;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    n = modules.blockchain.transactions.getUnconfirmedTransactionList(), s = crypto.createHash("sha256"), i = 0, e.t0 = _regenerator2.default.keys(n);
                case 4:
                    if ((e.t1 = e.t0()).done) {
                        e.next = 14;
                        break
                    }
                    if (c = e.t1.value, l = n[c], p = modules.logic.transaction.getBytes(l, !0), !(i + p.length > 8388608)) {
                        e.next = 10;
                        break
                    }
                    throw new Error("Playload length outof range");
                case 10:
                    s.update(p), i += p.length, e.next = 4;
                    break;
                case 14:
                    if (u = {
                            delegate: t.publicKey.toString("hex"),
                            height: private_.lastBlock.height + 1,
                            prevBlockId: private_.lastBlock.id,
                            pointId: o.id,
                            timestamp: r,
                            pointHeight: o.height,
                            count: n.length,
                            transactions: n,
                            payloadHash: s.digest().toString("hex"),
                            payloadLength: i
                        }, d = modules.logic.block.getBytes(u), u.signature = modules.api.crypto.sign(t, d), d = modules.logic.block.getBytes(u), u.id = modules.api.crypto.getId(d), g = modules.blockchain.round.getActiveKeypairs(), app.logger.info("Get active delegate keypairs len: " + g.length), f = modules.logic.consensus.createVotes(g, u), !modules.logic.consensus.hasEnoughVotes(f)) {
                        e.next = 28;
                        break
                    }
                    return e.next = 25, self.processBlock(u, {
                        local: !0,
                        broadcast: !0,
                        votes: f
                    });
                case 25:
                    app.logger.info("Forged new block id: " + u.id + " height: " + u.height), e.next = 42;
                    break;
                case 28:
                    "0.0.0.0:0", e.prev = 29, h = modules.logic.consensus.createPropose(t, u, "0.0.0.0:0"), e.next = 37;
                    break;
                case 33:
                    return e.prev = 33, e.t2 = e.catch(29), app.logger.error("Failed to create propose: " + e.t2.toString()), e.abrupt("return");
                case 37:
                    modules.logic.consensus.setPendingBlock(u), modules.logic.consensus.addPendingVotes(f), private_.proposeCache[h.hash] = !0, app.logger.info("Initiate propose on block id: " + u.id + ", height: " + u.height), modules.api.transport.message("propose", h);
                case 42:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [29, 33]
        ])
    }));
    return function(t, r, o, a) {
        return e.apply(this, arguments)
    }
}(), Blocks.prototype.applyBlock = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t, r) {
        var o, a, n;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    app.logger.trace("enter applyblock"), o = {}, e.prev = 2, app.sdb.beginBlock(), e.t0 = _regenerator2.default.keys(t.transactions);
                case 5:
                    if ((e.t1 = e.t0()).done) {
                        e.next = 16;
                        break
                    }
                    if (a = e.t1.value, (n = t.transactions[a]).senderId = modules.blockchain.accounts.generateAddressByPublicKey(n.senderPublicKey), !o[n.id]) {
                        e.next = 11;
                        break
                    }
                    throw new Error("Duplicate transaction in block: " + n.id);
                case 11:
                    return e.next = 13, modules.logic.transaction.apply(n, t);
                case 13:
                    o[n.id] = n, e.next = 5;
                    break;
                case 16:
                    e.next = 23;
                    break;
                case 18:
                    throw e.prev = 18, e.t2 = e.catch(2), app.logger.error("apply block error: " + e.t2), app.sdb.rollbackBlock(), new Error("Failed to apply block: " + e.t2);
                case 23:
                case "end":
                    return e.stop()
            }
        }, e, this, [
            [2, 18]
        ])
    }));
    return function(t, r) {
        return e.apply(this, arguments)
    }
}(), Blocks.prototype.loadBlocksPeer = function(e, t, r) {
    //t.ip="922660426";
    // console.log("loadBlocksPeer lastBlockHeight  e: ", e);
    // console.log("loadBlocksPeer: t", t);
    // console.log("loadBlocksPeer: r", r);
    app.logger.info("Load blocks after:", e), modules.api.transport.getPeer(t, "get", "/blocks/after", {
        lastBlockHeight: e
    }, function(e, t) {
        // console.log("afterBlock response e: ", e);
        // console.log("afterBlock response t: ", t);
        // console.log("getFirstBlock: ", t.body.blocks[0]);
        if (e || !t.body || !t.body.success) return r("Failed to load blocks from peer: " + (e || t.body.error));
        r(null, t.body.blocks)
    })
}, Blocks.prototype.loadBlocksOffset = function(e, t, r) {
    app.logger.trace("loadBlocksOffset !!!!!!!!!!")
}, Blocks.prototype.findCommon = function(e, t) {
    // console.log("findCommon e: ", e);
    // console.log("findCommon t: ", t);
    var r = this;
    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
        var a, n;
        return _regenerator2.default.wrap(function(r) {
            for (;;) switch (r.prev = r.next) {
                case 0:
                    return a = e.query, r.prev = 1, r.next = 4, app.model.Block.findAll({
                        condition: {
                            id: {
                                $in: a.ids
                            },
                            height: {
                                $between: [a.min, a.max]
                            }
                        },
                        sort: {
                            height: 1
                        }
                    });
                case 4:
                    if (n = r.sent, app.logger.debug("Blocks#findCommon", a, n), n && n.length) {
                        r.next = 8;
                        break
                    }
                    return r.abrupt("return", t("Common block not found"));
                case 8:
                    return r.abrupt("return", t(null, n[n.length - 1]));
                case 11:
                    return r.prev = 11, r.t0 = r.catch(1), r.abrupt("return", t("Failed to find common block: " + r.t0));
                case 14:
                case "end":
                    return r.stop()
            }
        }, o, r, [
            [1, 11]
        ])
    }))()
}, Blocks.prototype.getCommonBlock = function() {
    var e = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e(t, r, o) {
        //r.ip="54.254.174.74";
        // console.log("getCommonBlock t: ", t);
        // console.log("getCommonBlock r: ", r);
        // console.log("getCommonBlock o: ", o);
        var a, n, s, i, c, l, p;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    return a = t, e.next = 3, PIFY(private_.getIdSequence)(a);
                case 3:
                    // console.log("getCommonBlock e.sent: ", e.sent);
                    // console.log("a: ", a);
                    return n = e.sent, app.logger.debug("Blocks#getIdSequence", n), s = a, a = n.firstHeight, i = {
                        ids: n.ids,
                        max: s,
                        min: a
                    }, e.next = 10, PIFY(modules.api.transport.getPeer)(r, "get", "/blocks/common", i);
                case 10:
                // console.log("commonBlock e.sent: ", e.sent);
                    if ((c = e.sent).body) {
                        e.next = 13;
                        break
                    }
                    throw new Error("Failed to find common block");
                case 13:
                    if (c.body.success) {
                        e.next = 15;
                        break
                    }
                    throw new Error("Get common block error: " + c.body.error);
                case 15:
                    // console.log("commonBlock c: ", c);
                    return l = {
                        id: c.body.id,
                        height: c.body.height
                    }, c.body.prevBlockId && (l.prevBlockId = c.body.prevBlockId), e.next = 19, app.model.Block.findOne({
                        condition: l
                    });
                case 19:
                    if (p = e.sent) {
                        e.next = 22;
                        break
                    }
                    throw new Error("Failed to find local common block");
                case 22:
                    return e.abrupt("return", p);
                case 23:
                case "end":
                    return e.stop()
            }
        }, e, this)
    }));
    return function(t, r, o) {
        return e.apply(this, arguments)
    }
}(), Blocks.prototype.votes = function(e, t) {
    if (!e.query || !e.query.votes) return t("Invalid params");
    library.bus.message("votes", e.query.votes), t()
}, Blocks.prototype.getHeight = function(e, t) {
    t(null, {
        height: private_.lastBlock.height
    })
}, Blocks.prototype.getLastBlock = function() {
    return private_.lastBlock
}, Blocks.prototype.getBlock = function(e, t) {
    var r = e.query;
    modules.api.sql.select(extend({}, library.scheme.selector.blocks, {
        condition: {
            "b.id": r.id
        },
        fields: library.scheme.aliasedFields
    }), library.scheme.types, t)
}, Blocks.prototype.getBlocks = function(e, t) {
    var r = this;
    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
        var a, n;
        return _regenerator2.default.wrap(function(r) {
            for (;;) switch (r.prev = r.next) {
                case 0:
                    return r.prev = 0, r.next = 3, app.model.Block.count();
                case 3:
                    return a = r.sent, r.next = 6, app.model.Block.findAll({
                        limit: e.query.limit || 100,
                        offset: e.query.offset || 0
                    });
                case 6:
                    return n = r.sent, r.abrupt("return", t(null, {
                        blocks: n,
                        count: a
                    }));
                case 10:
                    return r.prev = 10, r.t0 = r.catch(0), r.abrupt("return", t("System error: " + r.t0));
                case 13:
                case "end":
                    return r.stop()
            }
        }, o, r, [
            [0, 10]
        ])
    }))()
}, Blocks.prototype.getBlocksAfter = function(e, t) {
    // console.log("getBlocksAfter e: ", e);
    // console.log("getBlocksAfter t: ", t);
    var r = this;
    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
        var a, n, s, i, c, l, p, u, d, g;
        return _regenerator2.default.wrap(function(r) {
            for (;;) switch (r.prev = r.next) {
                case 0:
                    return a = e.query, n = a.lastBlockHeight, r.next = 4, app.model.Block.findAll({
                        condition: {
                            height: {
                                $gt: n
                            }
                        },
                        limit: 200,
                        sort: {
                            height: 1
                        }
                    });
                case 4:
                    // console.log("getBlocksAfter case4 r.sent : ", r);
                    // console.log("getBlocksAfter case4 : s.length : ", s);
                    if ((s = r.sent) && s.length) {
                        r.next = 7;
                        break
                    }
                    return r.abrupt("return", t(null, {
                        blocks: []
                    }));
                case 7:
                    return app.logger.debug("Blocks#getBlocksAfter get blocks", e, s), i = s[s.length - 1].height, r.next = 11, app.model.Transaction.findAll({
                        condition: {
                            height: {
                                $gt: n,
                                $lte: i
                            }
                        }
                    });
                case 11:
                    for (p in c = r.sent, app.logger.debug("Blocks#getBlocksAfter get transactions", c), l = s[0].height, c) u = c[p], d = u.height, (g = s[d - l]) && (g.transactions || (g.transactions = []), g.transactions.push(u));
                    t(null, {
                        blocks: s
                    });
                case 16:
                case "end":
                    return r.stop()
            }
        }, o, r)
    }))()
}, Blocks.prototype.onMessage = function(e) {
    if (app.logger.debug("Blocks#onMessage last block = %j, event = %j", private_.lastBlock, e), "block" == e.topic) library.sequence.add(function(t) {
        var r = this,
            o = e.message.block,
            a = e.message.votes;
        a ? o.prevBlockId == private_.lastBlock.id && o.id != private_.lastBlock.id && o.id != private_.genesisBlock.id && o.height == private_.lastBlock.height + 1 ? (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e() {
            var n, s, i;
            return _regenerator2.default.wrap(function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return n = !0, e.prev = 1, app.sdb.rollbackBlock(), e.next = 5, self.processBlock(o, {
                            local: !1,
                            broadcast: !0,
                            votes: a
                        });
                    case 5:
                        e.next = 11;
                        break;
                    case 7:
                        e.prev = 7, e.t0 = e.catch(1), n = !1, app.logger.error("Blocks#processBlock error", e.t0);
                    case 11:
                        if (n)
                            for (s in o.transactions) modules.blockchain.transactions.removeUnconfirmedTransaction(o.transactions[s].id);
                        return e.prev = 12, i = modules.blockchain.transactions.getUnconfirmedTransactionList(), modules.blockchain.transactions.clearUnconfirmed(), e.next = 17, modules.blockchain.transactions.receiveTransactionsAsync(i);
                    case 17:
                        e.next = 22;
                        break;
                    case 19:
                        e.prev = 19, e.t1 = e.catch(12), app.logger.error("Failed to redo unconfirmed transactions", e.t1);
                    case 22:
                        t();
                    case 23:
                    case "end":
                        return e.stop()
                }
            }, e, r, [
                [1, 7],
                [12, 19]
            ])
        }))() : (0, _setImmediate3.default)(t) : app.logger.warn("realtime block consensus must have votes")
    });
    else if ("propose" == e.topic) {
        var t = e.message;
        if (private_.proposeCache[t.hash]) return;
        if (private_.proposeCache[t.hash] = !0, private_.lastPropose && private_.lastPropose.height == t.height && private_.lastPropose.generatorPublicKey == t.generatorPublicKey && private_.lastPropose.id != t.id) return void app.logger.warn("generate different block with the same height, generator: " + t.generatorPublicKey);
        if (t.height != private_.lastBlock.height + 1) return app.logger.warn("invalid propose height", t), void(t.height > private_.lastBlock.height + 1 && app.logger.warn("receive discontinuous propose height " + t.height));
        if (private_.lastVoteTime && Date.now() - private_.lastVoteTime < 5e3) return void app.logger.warn("ignore the frequently propose");
        if (app.logger.info("receive propose height " + t.height + " bid " + t.id), !modules.blockchain.round.validateProposeSlot(t)) return void app.logger.warn("Failed to validate propose slot");
        if (!modules.logic.consensus.acceptPropose(t)) return void app.logger.warn("Failed to accept propose: ");
        modules.api.transport.message("propose", t);
        var r = modules.blockchain.round.getActiveKeypairs();
        if (app.logger.debug("get active keypairs length", r.length), r && r.length > 0) {
            var o = modules.logic.consensus.createVotes(r, t);
            private_.lastVoteTime = Date.now(), private_.lastPropose = t, app.logger.info("send votes height " + o.height + " id " + o.id + " sigatures " + o.signatures.length), modules.api.transport.message("votes", o)
        }
    } else if ("votes" == e.topic) {
        o = e.message;
        var a = modules.logic.consensus.getPendingBlock();
        if (!a || o.height !== a.height || o.id !== a.id) return;
        library.sequence.add(function(e) {
            var t = modules.logic.consensus.addPendingVotes(o);
            if (t && t.signatures && app.logger.info("receive new votes, total votes number " + t.signatures.length), modules.logic.consensus.hasEnoughVotes(t)) {
                var r = a.height,
                    n = a.id;
                t.signatures = t.signatures.slice(0, Math.min(6, Math.ceil(2 * slots.delegates / 3))), (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function o() {
                    return _regenerator2.default.wrap(function(o) {
                        for (;;) switch (o.prev = o.next) {
                            case 0:
                                return o.prev = 0, o.next = 3, self.processBlock(a, {
                                    local: !0,
                                    broadcast: !0,
                                    votes: t
                                });
                            case 3:
                                app.logger.info("Forged new block id: " + n + " height: " + r), o.next = 9;
                                break;
                            case 6:
                                o.prev = 6, o.t0 = o.catch(0), app.logger.error("Failed to process block", {
                                    block: a,
                                    error: o.t0
                                });
                            case 9:
                                e();
                            case 10:
                            case "end":
                                return o.stop()
                        }
                    }, o, this, [
                        [0, 6]
                    ])
                }))(), e()
            } else(0, _setImmediate3.default)(e)
        })
    }
}, Blocks.prototype.onBlockchainLoaded = function() {
    private_.loaded = !0
}, Blocks.prototype.onBind = function(e) {
    var t = this;
    modules = e, (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function e() {
        var r, o;
        return _regenerator2.default.wrap(function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                    return e.prev = 0, e.next = 3, PIFY(modules.api.dapps.getDApp)();
                case 3:
                    return app.meta = e.sent, app.logger.info("app.meta", app.meta), e.next = 7, app.model.Block.count();
                case 7:
                    if (r = e.sent, app.logger.info("Blocks found:", r), 0 !== r) {
                        e.next = 14;
                        break
                    }
                    return e.next = 12, self.processBlock(private_.genesisBlock, {});
                case 12:
                    e.next = 18;
                    break;
                case 14:
                    return e.next = 16, app.model.Block.findOne({
                        condition: {
                            height: r
                        }
                    });
                case 16:
                    o = e.sent, self.setLastBlock(o);
                case 18:
                    library.bus.message("blockchainLoaded"), e.next = 25;
                    break;
                case 21:
                    e.prev = 21, e.t0 = e.catch(0), app.logger.error("Failed to prepare local blockchain", e.t0), process.exit(0);
                case 25:
                case "end":
                    return e.stop()
            }
        }, e, t, [
            [0, 21]
        ])
    }))()
}, module.exports = Blocks;
