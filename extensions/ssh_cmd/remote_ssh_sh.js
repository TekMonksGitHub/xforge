/** 
 * remote_ssh_sh.js, Runs remote SSH scripts
 * 
 * (C) 2018 TekMonks. All rights reserved.
 */
const os = require("os");
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const agentConf = {
    "shellexecprefix_win32": ["cmd.exe", "/s", "/c"],
    "shellexecprefix_linux": ["/bin/sh","-c"],
    "shellexecprefix_darwin": ["/bin/sh","-c"],
    "shellexecprefix_freebsd": ["/bin/sh","-c"],
    "shellexecprefix_sunos": ["/bin/sh","-c"]
}

/**
 * Runs remote SSH script on given host
 * @param {object} conf Contains {user, password, and host}
 * @param {string} remote_script The script to run, path to it
 * @param {object} extra_params The array of parameters
 * @param {boolean} stream If set to true, output will be streamed to logs as it happens
 * @param {object} callback err = exitCode in case or error or null otherwise,stdout,stderr
 */
exports.runRemoteSSHScript = (conf, remote_script, extra_params, stream, callback) => {
    const script = path.normalize(`${__dirname}/ssh_cmd.${process.platform == "win32"?"bat":"sh"}`);

    expandExtraParams(extra_params, remote_script, (err, expanded_remote_script) => {
        if (err) {callback({"result":false, "err":err, "msg": err.toString()}); return;}

        processExec( agentConf["shellexecprefix_"+process.platform], script, 
            [conf.user, conf.password, conf.hostkey, expanded_remote_script, conf.host], 
            stream, callback );
    });    
}

function processExec(cmdProcessorArray, script, paramsArray, stream, callback) {
    const spawnArray = cmdProcessorArray.slice(0);

    const quoter = process.platform == "win32" ? '"':"'";
    const paramsArrayCopy = []; paramsArray.forEach((element, i) => { paramsArrayCopy[i] = quoter+element+quoter;});
    let scriptCmd = quoter+script+quoter + " " + paramsArrayCopy.join(" ");
    scriptCmd = process.platform == "win32" ? '"'+scriptCmd+'"' : scriptCmd;
    spawnArray.push(scriptCmd);
    const shellProcess = spawn(spawnArray[0], spawnArray.slice(1), {windowsVerbatimArguments: true});

    let stdout = "", stderr = "";

    shellProcess.stdout.on("data", data => {
        stdout += String.fromCharCode.apply(null, data);
        if (stream) CONSTANTS.LOGINFO(`[SSH_CMD] [PID:${shellProcess.pid}]\n${data}`);
    });

    shellProcess.stderr.on("data", data => {
        stderr += String.fromCharCode.apply(null, data);
        if (stream) CONSTANTS.LOGWARN(`[SSH_CMD] [PID:${shellProcess.pid}]\n${data}`);
    });

    shellProcess.on("exit", exitCode => {
        if (stderr.trim() == "Access denied" && process.platform == "win32") exitCode = 1; // fix plink fake success issue on Windows
        callback(exitCode?exitCode:null, stdout, stderr)
    });
}

function expandExtraParams(extra_params, remote_script, callback) {
    if (!extra_params || !extra_params.length) {callback(null, remote_script); return;}

    fs.readFile(remote_script, "utf-8", (err, data) => {
        if (err) {callback(err, null); return;}

        for (const [i,param] of extra_params.entries()) data = replaceAll(data, "{"+i+"}", param);

        const tmpFile = path.resolve(os.tmpdir()+"/"+(Math.random().toString(36)+'00000000000000000').slice(2, 11));
        fs.writeFile(tmpFile, data, err => {
            if (err) {callback(err, null); return;}
            else callback(null, tmpFile);
        });
    });
}

function replaceAll(str, find, replace) {
    find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");;

    str = str.replace(new RegExp(find, 'g'), replace);
    return str;
}