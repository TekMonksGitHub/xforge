/*
 * XForge Build file for JS projects
 */
const fs = require("fs");
const path = require("path");
const util = require("util");
const mkdirAsync = util.promisify(fs.mkdir);
const existsAsync = util.promisify(fs.exists);
const {js_compile} = require(`${CONSTANTS.EXTDIR}/js_compiler.js`);

// build
exports.make = async function(source, out, useTerser) {
	try {
        // normalize paths
        source = path.resolve(source); out = path.resolve(out);

        // copy source to out
        if (!await existsAsync(out)) await mkdirAsync(out, {recursive:true});
        await CONSTANTS.SHELL.cp("-RLf", `${source}/*`, `${out}/`);
        
        // find JS files in out
        let jsFiles = await CONSTANTS.SHELL.find(out);
        jsFiles = jsFiles?jsFiles.filter(file=>file.endsWith(".js") || file.endsWith(".mjs")):[];

        // find all source files, setup the compilation promises 
        const promises = []; for (let jsFile of jsFiles) {
            jsFile = path.resolve(jsFile);
            promises.push(_compileFile(jsFile, useTerser?useTerser.toLowerCase()=='terser':false));
        }

		// wait for completion
		await Promise.all(promises);

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
        CONSTANTS.LOGHELP("Build command format: xforge -c -f jscompile.xf.js -o source_js_folder -o target_js_folder [-o terser]")
		return CONSTANTS.HANDLE_BUILD_ERROR(err); 
	}
}

async function _compileFile(jsFile, useTerser) {
    await js_compile(jsFile, jsFile+".done", useTerser);
    await CONSTANTS.SHELL.mv(jsFile+".done", jsFile);
}
