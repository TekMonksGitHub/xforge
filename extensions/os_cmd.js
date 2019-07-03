/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs OS commands
 */
const {exec} = require("child_process");
const {Ticketing} = require(`${CONSTANTS.LIBDIR}/Ticketing.js`);
const ticketing = new Ticketing(CONSTANTS.MAX_PROCESSES, "Process pool exhaused, waiting.");

exports.os_cmd = cmd => {
    CONSTANTS.LOGINFO(`[REQUEST]: ${cmd}`);

    return new Promise((resolve, reject) => ticketing.getTicket(_=>{
        exec(cmd, (error, data, stderr) => {
            ticketing.releaseTicket();
            
            CONSTANTS.LOGEXEC(`[PID:${process.pid}] ${cmd}`);

            if (data) CONSTANTS.LOGINFO(`[PID:${process.pid}] ${data}`);
            if (stderr && error) CONSTANTS.LOGERROR(`[PID:${process.pid}] ${stderr}`);
            else if (stderr) CONSTANTS.LOGWARN(`[PID:${process.pid}] ${stderr}`);

            if (error) reject(error);
            else resolve(data);
        });
    }));
}