/**
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * JS Compiler. Compilers supported are:
 * Google Closure Compiler
 * Terser
 */
const fs = require("fs");
const util = require("util");
const path = require("path");
const mkdirAsync = util.promisify(fs.mkdir);
const existsAsync = util.promisify(fs.exists);
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const {os_cmd} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);
const COMPILER_CMD_GOOGLE = `npx google-closure-compiler --js`;
const COMPILER_CMD_TERSER = `npx terser`;

/**
 * Compiles the JS file via Google Closure Compiler
 * @param {string} source_file The source file
 * @param {string} output_file The output file - will create paths if needed
 * @param {boolean} useTerser  Whether to use Terser, if not set, Google Closure Compiler is used
 */
exports.js_compile = async (source_file, output_file, useTerser=false) => {
    if (utils.checkIncrementalSkip(output_file, source_file)) {CONSTANTS.LOGINFO(`${output_file} is newer than ${source_file}. Skipping.`); return;}

    const outDir = path.dirname(output_file); 
    if (!await existsAsync(outDir)) mkdirAsync(outDir, {recursive:true});
    const cmd = useTerser?`${COMPILER_CMD_TERSER} "${source_file}" -c -m -o "${output_file}"`:`${COMPILER_CMD_GOOGLE} "${source_file}" --js_output_file "${output_file}"`;
    return os_cmd(cmd);
}
