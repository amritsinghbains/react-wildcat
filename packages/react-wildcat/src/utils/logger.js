"use strict";

const chalk = require("chalk");
const wildcatConfig = require("./getWildcatConfig")();
const serverSettings = wildcatConfig.serverSettings;

let log, env;

if (serverSettings.graylog) {
    env = serverSettings.graylog.fields.env;
    log = require("gelf-pro");
    log.setConfig(serverSettings.graylog);
}

const logMethods = {
    "error": "red",
    "info": "magenta",
    "log": null,
    "meta": "gray",
    "ok": "green",
    "warn": "yellow"
};

const mapLogMethods = {
    "error": "error",
    "info": "info",
    "log": "info",
    "meta": "info",
    "ok": "info",
    "warn": "error"
};

function Logger(id) {
    this.id = id;
    return this;
}

function graylog(args, method) {
    if (!log || !env || env === "development") {
        return;
    }
    return log[mapLogMethods[method] || "info"](chalk.stripColor(args.join(" ")));
}

Object.keys(logMethods).forEach((method, ...args) => {
    Logger.prototype[method] = function () {
        args.unshift(`${this.id}  ~>`);

        args.forEach((arg, i) => {
            const color = logMethods[method];

            if (typeof arg === "string" && color) {
                args[i] = chalk.styles[color].open + arg + chalk.styles[color].close;
            }
        });

        if (console[method]) {
            graylog(args, method);
            return console[method].apply(console, args);
        }

        graylog(args);
        return console.log.apply(console, args);
    };
});

module.exports = Logger;
