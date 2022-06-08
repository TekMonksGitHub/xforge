/**
 * Runs shell commands or files
 */
const {os_cmd} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);

// build
exports.make = async function(cmd, ...params) {
	try {
        let cmdToRun = cmd; if (params && params.length) cmdToRun += " " + params.join(" ");
        const out = await os_cmd(cmd, false, {XFORGE_FLAG: "TRUE"});
        CONSTANTS.LOGINFO(out);

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
        CONSTANTS.LOGHELP("Build command format: xforge -c -f execCmd.xf.js -o command")
		return CONSTANTS.HANDLE_BUILD_ERROR(`Build failed due to error: ${err.toString()}`); 
	}
}