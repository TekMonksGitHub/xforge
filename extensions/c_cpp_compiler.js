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
const {os_cmd_sync} = require(`${CONSTANTS.EXTDIR}/os_cmd.js`);
const conf = require(`${CONSTANTS.CONFDIR}/c_cpp_compiler.json`);

/**
 * Will compile the give source files using C/C++ compiler
 * @param {array} source_files The list of source files as an array
 * @param {string} compiler_cmd The compiler command
 * @param {array} include_paths The include paths
 * @param {string} output_directory The output directory
 * @param {string} output_extension Optional: The output extension, if not set then .o is assumed
 * @param {boolean} isWindows Optional: Whether we are on Windows. If not set, then assumed false
 * @param {boolean} deepDependecyAnalysis Optional: Whether to override global settings, and perform a deep dependency 
 *                                  analysis or skip. If set and true, deep dependency analysis will be done, 
 *                                  if set and false, then not. If not set, the global settings will be used.
 * @returns Promise which resolves or rejects once compilation is done
 */
exports.c_cpp_compile = (source_files, compiler_cmd, include_paths, output_directory, output_extension, isWindows, 
      deepDependecyAnalysis=conf.deepDependencyAnalysis) => {

   if (!output_extension) output_extension = ".o";

   const includeOption = isWindows ? "/I" : "-I";
   const outputOption = isWindows ? "/Fo" : "-o";

   let includeOptions = ""; 
   for (const include_path of include_paths) includeOptions += `${includeOption}"${include_path}" `;

   const osCmds = []; for (let source_file of source_files) {
      source_file = path.resolve(source_file);

      let output_file = path.basename(source_file);
      output_file = path.resolve(`${output_directory}/${output_file.substring(0, output_file.lastIndexOf("."))}${output_extension}`);

      if (utils.checkIncrementalSkip(output_file, _getDependentSourceFilesSync(source_file, deepDependecyAnalysis))) {
         CONSTANTS.LOGINFO(`${output_file} is newer than ${source_file} and dependencies. Skipping.`); continue; }
      
      const cmd = `${compiler_cmd} ${includeOptions} "${source_file}" ${outputOption}"${output_file}"`;
      osCmds.push(cmd);
   }

   const promises = []; for (cmd of osCmds) promises.push(os_cmd(cmd));

   return Promise.all(promises);
}

/**
 * Links the given object files into a final exe
 * @param {string} linker_cmd The linker command
 * @param {array} object_files The list of object files to link
 * @param {string} out Path to the out file
 * @param {boolean} isWindows Optional: Are we on Windows? If not set, then assumed false.
 * @returns Promise which resolves or rejects once compilation is done
 */
exports.c_cpp_link = (linker_cmd, object_files, out, isWindows) => {
   if (utils.checkIncrementalSkip(out, object_files)) {CONSTANTS.LOGINFO(`${out} is newer than object file dependencies. Skipping linking.`); return Promise.resolve(); }

   const outOption = isWindows ? "/OUT:" : "-o "
   const objFiles = object_files.join(" ");

   return os_cmd([linker_cmd, `${outOption}${out}`, objFiles].join(" "));
}

function _getDependentSourceFilesSync(sourceFile, doDeepDependencyAnalysis) {
   if (!doDeepDependencyAnalysis) return [sourceFile];

   const cmdOut = os_cmd_sync(`${conf.dependency_generator} ${sourceFile}`);
   if (cmdOut.code != 0) {
      CONSTANTS.LOGERROR(`Dependency analysis failed for ${sourceFile} with error ${cmdOut.error}, deep depency analysis disabled.`);
      return [sourceFile];
   }

   const dependencies = cmdOut.out.replace(/\\\n/g, " ").split(":")[1].trim().split(" ").filter(str => str.trim()!=""); // TOFIX: paths with spaces won't work here
   return dependencies;
}