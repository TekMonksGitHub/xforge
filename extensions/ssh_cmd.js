/** 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Runs remote SSH commands. Asynchronously. 
 */
const {Ticketing} = require(`${CONSTANTS.LIBDIR}/Ticketing.js`);
const remote_ssh = require(`${CONSTANTS.EXTDIR}/ssh_cmd/remote_ssh_sh.js`);

/**
 * Runs remote command via ssh. Gateway to cloud and remote builds.
 * To run remote builds on XForge use this and install XForge on remote machines.
 * @param {string} host The hostname or IP adddress
 * @param {string} user The login ID
 * @param {string} password The login password
 * @param {string} hostkey The hostkey - required on Windows, optional on Linux
 * @param {string} shellScriptPath Path to the shell script to run remotely
 * @param {array} scriptParams Parameters to pass to the script
 * @param {boolean} stream Whether or not to stream the output as it happens
 * @returns An object of the format {exitCode: The remote script exit code, stdout: Std out, stderr: Std err}
 */
exports.ssh_cmd = (host, user, password, hostkey, shellScriptPath, scriptParams, stream = false) => {
    if (!CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"])
        CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"] = new Ticketing(CONSTANTS.MAX_PROCESSES, "Process pool exhausted, waiting.");
    const ticketing = CONSTANTS.OBJECT_STORE["ext.os_cmd.ticketing"];

    CONSTANTS.LOGINFO(`[SSH_CMD]: ${user}@${host} -> ${scriptParams.join(" ")}`);

    return new Promise((resolve, reject) => ticketing.getTicket(_=>{
        remote_ssh.runRemoteSSHScript({user, password, host, hostkey}, shellScriptPath, scriptParams, stream, (err,stdout,stderr) => {
            ticketing.releaseTicket();
            if (!err) resolve({exitCode:0, stdout, stderr});
            else reject({exitCode:err, stdout, stderr});
        });
    }));
}
