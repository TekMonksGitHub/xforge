/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * C/C++ Compile and Link Class
 * Compilers supported are 
 * Clang, GCC, Oracle CC, MSVC (Windows), Intel C/C++, IBM C/C++
 */

const path = require("path");
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const {os_cmd} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);

 exports.c_cpp_compile = (source_files, compiler_cmd, include_paths, output_directory, output_extension, isWindows) => {
    if (!output_extension) output_extension = ".o";

    const includeOption = isWindows ? "/I" : "-I";
    const outputOption = isWindows ? "/Fo" : "-o";

    let includeOptions = ""; 
    for (const include_path of include_paths) includeOptions += `${includeOption}"${include_path}" `;

    const osCmds = []; for (let source_file of source_files) {
        source_file = path.resolve(source_file);

        let output_file = path.basename(source_file);
        output_file = path.resolve(`${output_directory}/${output_file.substring(0, output_file.lastIndexOf("."))}${output_extension}`);

        if (utils.checkIncrementalSkip(output_file, source_file)) {CONSTANTS.LOGINFO(`${output_file} is newer than ${source_file}. Skipping.`); continue; }
        
        const cmd = `${compiler_cmd} ${includeOptions} "${source_file}" ${outputOption}"${output_file}"`;
        osCmds.push(cmd);
    }

    const promises = []; for (cmd of osCmds) promises.push(os_cmd(cmd));

    return Promise.all(promises);
 }

 exports.c_cpp_link = (linker_cmd, object_files, out, isWindows) => {
    const outOption = isWindows ? "/OUT:" : "-o"
    const objFiles = object_files.join(" ");

    return os_cmd([linker_cmd, `${outOption}${out}`, objFiles].join(" "));
 }