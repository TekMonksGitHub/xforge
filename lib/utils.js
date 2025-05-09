/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

/*
 * Returns a temp file, optionally with data given written to it
 */
exports.createTempfile = function(name="temp_file", data="", encoding="utf8") {
    return new Promise((resolve, reject) => {
        const tempPath = path.join(os.tmpdir(), "~$xforge-");
        fs.mkdtemp(tempPath, (err, folder) => {
            if (err) return reject(err);
            const file_name = path.join(folder, name);
            fs.writeFile(file_name, data, encoding, error_file => error_file?reject(error_file):resolve(file_name));
        })
    })
}

/**
 * Checks if the file is newwe than the one given
 * @param {string} fileToCompareTo Path of the file to compare to
 * @param {string} fileToCompare Path of the file to compare 
 * @returns true if the file is newwe than the one given else false
 */
exports.isFileNewerThanSync = (fileToCompareTo, fileToCompare) => { try {
    return fs.statSync(fileToCompareTo).mtime > fs.statSync(fileToCompare).mtime;} catch (e) {return false;} }

/**
 * If the file is newer returns false else true
 * @param {string} fileToCompareTo Path of the file to compare to
 * @param {string} filesToCompare Path of the files to compare 
 * @returns true if all files are newer so can be skipped, false otherwise
 */
exports.checkIncrementalSkip = (fileToCompareTo, filesToCompare) => {
    if (!CONF.incremental_mode) return false;   // not incremental, no skip
    for (const fileToCompare of filesToCompare) if (!exports.isFileNewerThanSync(fileToCompareTo, fileToCompare)) return false;
    return true;
}

/**
 * Finds all files matching the given shell pattern.
 * @param {string} path The root path to start search from
 * @param {string} pattern The shell pattern
 * @returns All files matching the given shell pattern.
 */
exports.findAllFilesSync = function(path, pattern) {
    const collater = [];
    let patternJS = pattern.replaceAll("\\", "/").replaceAll(".", "\\.").replaceAll("**", "*").replaceAll("*", ".*");
    if (patternJS.endsWith("/") || patternJS.endsWith("\\")) patternJS = patternJS.substring(0,patternJS.length-1);
    patternJS = `^${patternJS}$`;
    const patternRegExp = new RegExp(patternJS);
    for (const entry of fs.readdirSync(path)) {
        const thispath = `${path}/${entry}`, stats = fs.statSync(thispath);
        if (stats.isDirectory()) {
            const filesFound = exports.findAllFilesSync(thispath, pattern);
            collater.push(...filesFound);
        }
        else if (thispath.match(patternRegExp)) collater.push(thispath);
    }
    return collater;
}