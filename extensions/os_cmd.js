/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs OS commands
 */
const {exec} = require("child_process");

let currentActiveProcesses = 0;

exports.os_cmd = cmd => {
    const osCmd = (resolve, reject) => {
        currentActiveProcesses++;
        const process = exec(cmd, (error, data, stderr) => {
            currentActiveProcesses--;
            
            CONSTANTS.LOGEXEC(`[PID:${process.pid}] ${cmd}`);

            if (data) CONSTANTS.LOGINFO(`[PID:${process.pid}] ${data}`);
            if (stderr && error) CONSTANTS.LOGERROR(`[PID:${process.pid}] ${stderr}`);
            else if (stderr) CONSTANTS.LOGWARN(`[PID:${process.pid}] ${stderr}`);

            if (error) reject(error);
            else resolve(data);
        });
    }

    return getOSTaskPromise(osCmd);
}

function getOSTaskPromise(osCmd) {
    return new Promise(osCmd);
}