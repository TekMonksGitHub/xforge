/*
 * XForge Build file for simple C/C++ projects, using GCC
 */
const fs = require("fs");
const path = require("path");
const util = require("util");
const mkdirAsync = util.promisify(fs.mkdir);
const existsAsync = util.promisify(fs.exists);
const {c_cpp_link} = require(`${CONSTANTS.EXTDIR}/c_cpp_compiler.js`);
const {c_cpp_compile} = require(`${CONSTANTS.EXTDIR}/c_cpp_compiler.js`);

let compiler_cmd_c = "-c", compiler_cmd_cpp = "-c";

// build
exports.make = async function(sourcePath, includePaths, outPath, linkedFile, compilers, linker) {
	try {
        // check params and usage
        if (!sourcePath||!includePaths||!outPath) throw ("Bad usage error.");   

        // normalize paths
        sourcePath = path.resolve(sourcePath); outPath = path.resolve(outPath); 
        includePaths = includePaths.split(" "); for (const [i, includePath] of includePaths.entries()) includePaths[i] = path.resolve(includePath); 

        // setup compiler commands
        if (!compilers) compilers = ["gcc","g++"]; else compilers = compilers.split(";");  if (compilers.length == 1) compilers[1] = compilers[0];
        compiler_cmd_c = `${compilers[0]} ${compiler_cmd_c}`; compiler_cmd_cpp = `${compilers[1]} ${compiler_cmd_cpp}`
                
        // create output directory if needed
        if (!await existsAsync(outPath)) await mkdirAsync(outPath, {recursive:true});

        // find C/C++ files to compile
        let ccppFiles = await CONSTANTS.SHELL.find(sourcePath);
        const cFiles = ccppFiles?ccppFiles.filter(file=>file.endsWith(".c")):[];
        const cppFiles = ccppFiles?ccppFiles.filter(file=>file.endsWith(".cpp")):[];

        // compile C and CPP files seperately
        const promisesCCompile = c_cpp_compile(cFiles, compiler_cmd_c, includePaths, outPath);
        const promisesCPPCompile = c_cpp_compile(cppFiles, compiler_cmd_cpp, includePaths, outPath);

		// wait for completion of compilation
		await Promise.all([promisesCCompile, promisesCPPCompile]);

        // link if needed
        if (linkedFile && linkedFile.trim() != "") {
            const o_files = _getOFiles(cFiles, outPath); o_files.push(..._getOFiles(cppFiles, outPath));
            await c_cpp_link(linker||"ld -lc", o_files, linkedFile);
        }

		CONSTANTS.LOGSUCCESS();
	} catch (err) { 
        CONSTANTS.LOGHELP("Build command format: xforge -c -f ccppcompile.xf.js -o source_code_folder -o include_paths_seperated_by_space -o target_out_folder [-o compiler_commands_for_c_and_c++_and_switches_seperated_by_a_semicolon]")
		return CONSTANTS.HANDLE_BUILD_ERROR(err); 
	}
}

function _getOFiles(sourceFiles, outpath) {
    const retFiles = [];
    for (const file of sourceFiles) retFiles.push(path.resolve(outpath+"/"+path.basename(file).substring(0, path.basename(file).lastIndexOf("."))+".o"));
    return retFiles;
}