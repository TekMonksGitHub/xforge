/* 
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * JS Compiler. Compilers supported are:
 * Google Closure Compiler
 */

const path = require("path");
const {os_cmd} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);
const compiler_cmd = `java -jar ${CONSTANTS.LIBDIR}/3p/jscc.jar --compilation_level ADVANCED_OPTIMIZATIONS --js`;

 exports.c_cpp_compile = (source_files, output_directory) => {
    const osCmds = []; for (const source_file of source_files) {
        source_file = path.resolve(source_file);

        const output_file = path.resolve(`${output_directory}/${path.basename(source_file)}`);

        if (isFileNewerThan(output_file, source_file)) {CONSTANTS.LOGINFO(`${output_file} is newer than ${source_file}. Skipping.`); continue;}
        
        const cmd = `${compiler_cmd} "${source_file}" "${output_file}"`;
        osCmds.push(cmd);
    }

    const promises = []; for (cmd of osCmds) promises.push(os_cmd(cmd));

    return Promise.all(promises);
 }