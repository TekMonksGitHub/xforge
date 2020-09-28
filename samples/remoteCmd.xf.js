/*
 * XForge sample remote command script
 */
const path = require("path");
const {ssh_cmd} = require(`${CONSTANTS.EXTDIR}/ssh_cmd.js`);

// build
exports.make = async function(host, user, password, hostkey, scriptPath) {
	try {
        // normalize paths
        scriptPath = path.resolve(scriptPath); 

        // run the script
        await ssh_cmd(host, user, password, hostkey, scriptPath, [...arguments].slice(4), true)

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
		return CONSTANTS.HANDLE_BUILD_ERROR(`Build failed with remote exit code: ${err.exitCode}, due to error: ${err.stderr}`); 
	}
}