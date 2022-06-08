/** 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs OS commands
 */
const {exec} = require("child_process");
const {execSync} = require("child_process");
const {Ticketing} = require(`${CONSTANTS.LIBDIR}/Ticketing.js`);

const _toBuffer = (pid, data) => Buffer.concat([Buffer.from(`[PID:${pid}]`), Buffer.from(data, "binary")]);

exports.os_cmd = (cmd, stream = false, environment) => {
    if (!CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"])
        CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"] = new Ticketing(CONSTANTS.MAX_PROCESSES, "Process pool exhausted, waiting.");
    const ticketing = CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"];

    CONSTANTS.LOGINFO(`[REQUEST]: ${cmd}`);

    return new Promise((resolve, reject) => ticketing.getTicket(_=>{
        let osProcess = exec(cmd, {maxBuffer: CONSTANTS.MAX_STDIO_BUFFER, encoding : "binary", env: environment}, (error, data, stderr) => {
            ticketing.releaseTicket();
            
            CONSTANTS.LOGEXEC(`[PID:${process.pid}] ${cmd}`);

            if (data && !stream) CONSTANTS.LOGINFO(_toBuffer(process.pid, data), true);
            if (stderr && error) CONSTANTS.LOGERROR(_toBuffer(process.pid, stderr), true);
            else if (stderr && !stream) CONSTANTS.LOGWARN(_toBuffer(process.pid, stderr), true);

            if (error) reject(error);
            else resolve(data);
        });

        if (stream) {
            osProcess.stdout.on("data", data => CONSTANTS.LOGINFO(_toBuffer(process.pid, data), true));
            osProcess.stderr.on("data", data => CONSTANTS.LOGWARN(_toBuffer(process.pid, data), true));
        }
    }));
}

exports.os_cmd_sync = (cmd, environment) => {try{ return {out: execSync(cmd, 
    {maxBuffer: CONSTANTS.MAX_STDIO_BUFFER, encoding : "binary", env: environment}).toString("utf8"), code: 0};} catch (err) {return {out: err.stdout.toString("utf8"), error: err.stderr.toString("utf8"), code: err.status};}}