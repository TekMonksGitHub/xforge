/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
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

exports.isFileNewerThanSync = (fileToCompareTo, fileToCompare) => { try {
    return fs.statSync(fileToCompareTo).mtime > fs.statSync(fileToCompare).mtime;} catch (e) {return false;} }

exports.checkIncrementalSkip = (fileToCompareTo, filesToCompare) => {
    if (!CONF.incremental_mode) return false;   // not incremental, no skip
    for (const fileToCompare of filesToCompare) if (!exports.isFileNewerThanSync(fileToCompareTo, fileToCompare)) return false;
    return true;
}