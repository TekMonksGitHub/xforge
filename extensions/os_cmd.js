/** 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs OS commands
 */
const {exec} = require("child_process");
const {execSync} = require("child_process");
const {Ticketing} = require(`${CONSTANTS.LIBDIR}/Ticketing.js`);

exports.os_cmd = (cmd, stream = false) => {
    if (!CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"])
        CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"] = new Ticketing(CONSTANTS.MAX_PROCESSES, "Process pool exhaused, waiting.");
    const ticketing = CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"];

    CONSTANTS.LOGINFO(`[REQUEST]: ${cmd}`);

    return new Promise((resolve, reject) => ticketing.getTicket(_=>{
        let osProcess = exec(cmd, {maxBuffer: CONSTANTS.MAX_STDIO_BUFFER}, (error, data, stderr) => {
            ticketing.releaseTicket();
            
            CONSTANTS.LOGEXEC(`[PID:${process.pid}] ${cmd}`);

            if (data && !stream) CONSTANTS.LOGINFO(`[PID:${process.pid}] ${data}`);
            if (stderr && error) CONSTANTS.LOGERROR(`[PID:${process.pid}] ${stderr}`);
            else if (stderr && !stream) CONSTANTS.LOGWARN(`[PID:${process.pid}] ${stderr}`);

            if (error) reject(error);
            else resolve(data);
        });

        if (stream) {
            osProcess.stdout.on("data", data => CONSTANTS.LOGINFO(`[PID:${process.pid}] ${data}`));
            osProcess.stderr.on("data", data => CONSTANTS.LOGWARN(`[PID:${process.pid}] ${data}`));
        }
    }));
}

exports.os_cmd_sync = cmd => {try{ return {out: execSync(cmd).toString("utf8"), code: 0};} catch (err) {return {out: err.stdout.toString("utf8"), error: err.stderr.toString("utf8"), code: err.status};}}