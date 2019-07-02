/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */
const path = require("path");
const colors = require("colors");
const getColoredMessage = (s, colorfunc) => exports.COLORED_OUT?colorfunc(s):s;

exports.LIBDIR = path.resolve(__dirname);
exports.EXTDIR = path.resolve(`${__dirname}/../extensions`);

exports.PROCESS_QUIESCE_TIME = 2;   // process quiesce time - sometimes process is done but disk is not

const shelljs = require("shelljs"); shelljs.config.silent = true; shelljs.config.fatal = true;
exports.SHELL = traceMethodCalls(shelljs);

exports.COLORED_OUT = false;

exports.LOGINFO = s => console.log(getColoredMessage(`[INFO] ${s}\n`, colors.green));
exports.LOGERROR = e => console.log(getColoredMessage(`[ERROR] ${getErrorMessage(e)}\n`, colors.red));
exports.LOGWARN = s => console.log(getColoredMessage(`[WARN] ${s}\n`, colors.yellow));
exports.LOGEXEC = s => console.log(getColoredMessage(`[EXEC] ${s}\n`, colors.blue));
exports.LOGSUCCESS = _ => exports.LOGINFO("Success, done.");
exports.LOGFAILURE = _ => exports.LOGERROR("Build failed.");

exports.EXITOK = _ => process.exit(0);
exports.EXITFAILED = _ => process.exit(1);

exports.HANDLE_BUILD_ERROR = e => {exports.LOGERROR(e); exports.LOGFAILURE(); exports.EXITFAILED();}

exports.MAX_PROCESSES = 20;

function getErrorMessage(e) {
    const type = typeof e; const keys = Object.keys(e);
    if (type === 'function' || type === 'object' && !!e && keys.length) return JSON.stringify(e);
    if (e instanceof Error) return `${e.message}\n[ERROR] ${e.stack}`;
    return e;
}

function traceMethodCalls(obj) {
    const handler = {
        get(target, propKey, _) {
            const origMethod = target[propKey];
            return function (...args) {
                return new Promise((resolve, reject) => {
                    const result = origMethod.apply(this, args);
                    const out = (result && result!="")?` -> ${JSON.stringify(result)}`:"";
                    CONSTANTS.LOGINFO(propKey + JSON.stringify(args) + out);
                    if (result.code) reject(result.stderr);
                    else resolve(result);
                })
            };
        }
    };
    return new Proxy(obj, handler);
}