/*
 * XForge Build file to generate a list of cacheable files for web applications
 */
const path = require("path");
const fspromises = require("fs").promises;

// build
exports.make = async function(webroot, out, filterPattern) {
	try {
        if ((!webroot)||(!out)) throw "Bad incoming arguments."; // check usage

        // normalize paths
        webroot = path.resolve(webroot).split(path.sep).join(path.posix.sep); out = path.resolve(out);
        
        // find all static files and add to the list
        const allFiles = (await CONSTANTS.SHELL.ls("-Rl",webroot));

        const cacheableFiles = allFiles.filter(fileStat=>fileStat.isFile() && (filterPattern?!fileStat.name.match(filterPattern):true)).map(fileStat => fileStat.name)
        await fspromises.writeFile(out, JSON.stringify(cacheableFiles, null, 4));

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
        CONSTANTS.LOGHELP("Build command format: xforge -c -f genCacheableFilesList.xf.js -o webroot -o outfile [-o filterPattern]");
        CONSTANTS.LOGHELP("Webroot is the webroot, outfile is the JSON file to write to, and filter pattern, if provided, skips files with names matching the pattern.");
		return CONSTANTS.HANDLE_BUILD_ERROR(err); 
	}
}