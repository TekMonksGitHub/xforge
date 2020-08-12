/*
 * XForge Build file for JS projects
 */
const path = require("path");
const {js_compile} = require(`${CONSTANTS.EXTDIR}/js_compiler.js`);

// build
exports.make = async function(source,out) {
	try {
        // normalize paths
        source = path.resolve(source); out = path.resolve(out);

		// copy source to out
        await CONSTANTS.SHELL.cp("-RLf", `${source}/*`, `${out}/`);
        
        // find JS files in out
        let jsFiles = await CONSTANTS.SHELL.find(out);
        jsFiles = jsFiles?jsFiles.filter(file=>file.endsWith(".js") || file.endsWith(".mjs")):[];

        // find all source files, setup the compilation promises 
        const promises = []; for (let jsFile of jsFiles) {
            jsFile = path.resolve(jsFile);
            promises.push(_compileFile(jsFile));
        }

		// wait for completion
		await Promise.all(promises);

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
		CONSTANTS.HANDLE_BUILD_ERROR(err); 
	}
}

async function _compileFile(jsFile) {
    await js_compile(jsFile, jsFile+".done");
    await CONSTANTS.SHELL.mv(jsFile+".done", jsFile);
}