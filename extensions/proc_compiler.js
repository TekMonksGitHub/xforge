/* 
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Oracle Pro*C Compiler Class
 */

const path = require("path");
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const {os_cmd} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);

 exports.proc_compile = (source_files, compiler_cmd, include_paths, output_directory, output_extension, dblogin) => {
    if (!output_extension) output_extension = ".o";

    const includeOption = "include=";
    const outputOption = "oname=";
    const inputOption = "iname=";
    const dbOption = "userid=";

    let includeOptions = "";
    for (const include_path of include_paths) includeOptions += `${includeOption}"${include_path}" `;

    const osCmds = []; for (let source_file of source_files) {
        source_file = path.resolve(source_file);

        let output_file = path.basename(source_file);
        output_file = path.resolve(`${output_directory}/${output_file.substring(0, output_file.lastIndexOf("."))}${output_extension}`);

        if (utils.checkIncrementalSkip(output_file, source_file)) {CONSTANTS.LOGINFO(`${output_file} is newer than ${source_file}. Skipping.`); continue; }
        
        const cmd = `${compiler_cmd} ${includeOptions} ${dblogin?dbOption+`"${dblogin}"`:""} ${inputOption}"${source_file}" ${outputOption}"${output_file}"`;
        osCmds.push(cmd);
    }

    let promises = [];
    for (cmd of osCmds) promises.push(os_cmd(cmd));

    return Promise.all(promises);
 }