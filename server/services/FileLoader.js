const path    = require("path")
const express = require("express")
const router  = express.Router()

const T_Service = require("../templates/T_Service")

const localesRouter = require("../routers/localesRouter")
const filesRouter = require("../routers/filesRouter")
const htmlRouter  = require("../routers/htmlRouter")
const libRouter   = require("../routers/libRouter")
const jsRouter    = require("../routers/jsRouter")

const jsonrpcErrors = require("../json-rpc_errors.json")


class FileLoader extends T_Service {
    constructor(args, config) {
        super(args, config)

        this.serviceType = "fl" // file loader

        this.app.use("/", this._getMainRouter())
        this.app.use("/enqlib/{0,}", libRouter)
        this.app.use("/html/{0,}", htmlRouter)
        this.app.use("/enex.webpack.js/{0,}", jsRouter)
        this.app.use(["/img/{0,}", "/file/{0,}", "/{0,}"], filesRouter)
        this.app.use("/locales", localesRouter)
    }

    _sendError (req, res, errorMsg) {
        res.send(JSON.stringify(this.jsonrpcUtil.makeResponseObject(req.body.id, false, errorMsg)))
    }

    _getMainRouter () {
        return router.post("/", (req, res, next) => {
            if (req.body.method !== "internal_request") {
                this._sendError(req, res, jsonrpcErrors.needInternalMethod)
                return
            }
            if (!Array.isArray(req.body.params) || req.body.params.length === 0) {
                this._sendError(req, res, jsonrpcErrors.emptyFieldParams)
                return
            }

            let urlPath = req.body.params[0]
            let allowedPaths = ["img", "html", "enex.webpack.js", "enqlib", "file", "locales"]

            if (urlPath === "/") {
                res.redirect(307, "html")
            } else if (allowedPaths.some(path => new RegExp(`/${path}.*`).test(urlPath))) {
                res.redirect(307, urlPath)
            } else {
                res.redirect(307, "file" + urlPath)
            }
        })
    }
}

module.exports = FileLoader