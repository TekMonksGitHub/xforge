/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */
const path = require("path");
const colors = require("colors");
const getColoredMessage = (s, colorfunc) => exports.COLORED_OUT?colorfunc(s):s;

exports.ROOTDIR = path.resolve(`${__dirname}/../`);
exports.LIBDIR = path.resolve(__dirname);
exports.EXTDIR = path.resolve(`${__dirname}/../extensions`);
exports.CONFDIR = path.resolve(`${__dirname}/../conf`);

const shelljs = require("shelljs"); shelljs.config.silent = true; shelljs.config.fatal = true;
exports.SHELL = traceMethodCalls(shelljs);

exports.OBJECT_STORE = {};

exports.COLORED_OUT = false;
exports.INPROCESSMODE = false;

exports.LOGINFO = s => console.info(getColoredMessage(`[INFO] ${s}\n`, colors.green));
exports.LOGERROR = e => console.error(getColoredMessage(`[ERROR] ${getErrorMessage(e)}\n`, colors.red));
exports.LOGWARN = s => console.warn(getColoredMessage(`[WARN] ${s}\n`, colors.yellow));
exports.LOGEXEC = s => console.info(getColoredMessage(`[EXEC] ${s}\n`, colors.blue));
exports.LOGHELP = s => console.info(getColoredMessage(`[HELP] ${s}\n`, colors.magenta));
exports.LOGSUCCESS = _ => exports.LOGINFO("Success, done.");
exports.LOGFAILURE = _ => exports.LOGERROR("Build failed.");

exports.COLOR = { 
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
  
    fgBlack: '\x1b[30m',
    fgRed: '\x1b[31m',
    fgGreen: '\x1b[32m',
    fgYellow: '\x1b[33m',
    fgBlue: '\x1b[34m',
    fgMagenta: '\x1b[35m',
    fgCyan: '\x1b[36m',
    fgWhite: '\x1b[37m',
  
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};

exports.logError =  (pid, msg) => {
    process.stderr.write(`${CONSTANTS.COLOR.fgRed}[ERROR] [PID:${pid}] `);
    process.stderr.write(msg, 'binary');
    process.stderr.write(`${CONSTANTS.COLOR.reset}\n`);
}

exports.logWarn =  (pid, msg) => {
    process.stderr.write(`${CONSTANTS.COLOR.fgYellow}[WARN] [PID:${pid}] `);
    process.stderr.write(msg, 'binary');
    process.stderr.write(`${CONSTANTS.COLOR.reset}\n`);
}

exports.logInfo =  (pid, msg) => {
    process.stdout.write(`${CONSTANTS.COLOR.fgGreen}[INFO] [PID:${pid}] `);
    process.stdout.write(msg, 'binary');
    process.stderr.write(`${CONSTANTS.COLOR.reset}\n`);
}

exports.EXITOK = _ => exports.INPROCESSMODE?0:process.exit(0);
exports.EXITFAILED = _ => exports.INPROCESSMODE?1:process.exit(1);

exports.HANDLE_BUILD_ERROR = e => {exports.LOGERROR(e); exports.LOGFAILURE(); return exports.EXITFAILED();}

exports.MAX_PROCESSES = 20;

exports.MAX_STDIO_BUFFER = 1024*1024*50;  // 50 MB STDIO buffer

function getErrorMessage(e) {
    if (e instanceof Error) return `${e.message}\n[ERROR] ${e.stack}`;

    const type = typeof e; const keys = Object.keys(e);
    if (type === 'function' || type === 'object' && !!e && keys.length) return JSON.stringify(e);

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

exports.SLEEP = function sleep(ms){ return new Promise(resolve=> setTimeout(resolve, ms)); }