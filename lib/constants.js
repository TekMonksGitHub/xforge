/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */
const path = require("path");

exports.ROOTDIR = path.resolve(`${__dirname}/../`);
exports.LIBDIR = path.resolve(__dirname);
exports.EXTDIR = path.resolve(`${__dirname}/../extensions`);
exports.CONFDIR = path.resolve(`${__dirname}/../conf`);

const shelljs = require("shelljs"); shelljs.config.silent = true; shelljs.config.fatal = true;
exports.SHELL = traceMethodCalls(shelljs);

exports.OBJECT_STORE = {};

exports.COLORED_OUT = false;
exports.INPROCESSMODE = false;

const COLOR = {
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
    fgLightGrey: '\x1b[37m',
    fgDarkGrey: '\x1b[90m',
    fgWhite: '\x1b[97m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
};

const _getAsBuffer = (logLevel, s, color) => Buffer.from(_getAsString(logLevel, s, color));

const _getAsString = (logLevel, s, color) => exports.COLORED_OUT ? `${color}[${logLevel}] ${s}${COLOR.reset}\n` : `[${logLevel}] ${s}\n`;

exports.LOGINFO = (s, logBinary) => {
    if (!logBinary) console.info(_getAsString('INFO', s, COLOR.fgGreen));
    else process.stdout.write(_getAsBuffer('INFO', s, COLOR.fgGreen), "binary");
}
exports.LOGERROR = (e, logBinary) => {
    if (!logBinary) console.error(_getAsString('ERROR', getErrorMessage(e), COLOR.fgRed));
    else process.stderr.write(_getAsBuffer('ERROR', e, COLOR.fgRed), "binary");
}
exports.LOGWARN = (s, logBinary) => {
    if (!logBinary) console.warn(_getAsString('WARN', s, COLOR.fgYellow));
    else process.stderr.write(_getAsBuffer('WARN', s, COLOR.fgYellow), "binary");
}
exports.LOGDEBUG = s => console.debug(_getAsString('DEBUG', s, COLOR.fgDarkGrey));
exports.LOGEXEC = s => console.info(_getAsString('EXEC', s, COLOR.fgBlue));
exports.LOGHELP = s => console.info(_getAsString('HELP', s, COLOR.fgMagenta));
exports.LOGSUCCESS = _ => exports.LOGINFO("Success, done.");
exports.LOGFAILURE = _ => exports.LOGERROR("Build failed.");
exports.LOGRED = s => console.log(exports.COLORED_OUT ? `${COLOR.fgRed}` + s + `${COLOR.reset}\n` : s);

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
                    const out = (result && result != "") ? ` -> ${JSON.stringify(result)}` : "";
                    CONSTANTS.LOGINFO(propKey + JSON.stringify(args) + out);
                    if (result.code) reject(result.stderr);
                    else resolve(result);
                })
            };
        }
    };
    return new Proxy(obj, handler);
}

exports.SLEEP = function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


