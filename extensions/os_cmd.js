/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs OS commands
 */
const cmmd = require("node-cmd");

let currentActiveProcesses = 0;
let processPoolExhaused = true;

exports.os_cmd = async cmd => {
    const osCmd = (resolve, reject) => {
        currentActiveProcesses++;
        const process = cmmd.get(cmd, (error, data, stderr) => {
            currentActiveProcesses--;
            
            CONSTANTS.LOGEXEC(`[PID:${process.pid}] ${cmd}`);

            if (data) CONSTANTS.LOGINFO(`[PID:${process.pid}] ${data}`);
            if (stderr && error) CONSTANTS.LOGERROR(`[PID:${process.pid}] ${stderr}`);
            else if (stderr) CONSTANTS.LOGWARN(`[PID:${process.pid}] ${stderr}`);

            if (error) setTimeout(_ => reject(error), CONSTANTS.PROCESS_QUIESCE_TIME);
            else setTimeout(_ => resolve(data), CONSTANTS.PROCESS_QUIESCE_TIME);
        });
    }

    return getOSTaskPromise(osCmd);
}

function getOSTaskPromise(osCmd) {
    const checkOSPool = _ => {
        if (currentActiveProcesses < CONSTANTS.MAX_PROCESSES) {
            processPoolExhaused = false;
            return new Promise(osCmd);
        }
        else {
            if (!processPoolExhaused) {CONSTANTS.LOGWARN("XForge process pool exhausted, waiting."); processPoolExhaused = true;}
            setTimeout(checkOSPool, 100);
        }
    };

    return checkOSPool();
}