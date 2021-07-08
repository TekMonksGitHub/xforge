/* 
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 * 
 * Ticketing system
 */

exports.Ticketing = class Ticketing {
    constructor(max_depth, wait_msg) {
        this.max_depth = max_depth; 
        this.wait_msg = wait_msg;

        this.current_depth = 0;
        this.queue = [];
    }

    getTicket(callback) {
        if (this.current_depth < this.max_depth) {this.current_depth++; callback();}
        else {if (this.wait_msg) CONSTANTS.LOGDEBUG(this.wait_msg); this.queue.push(callback);}
    }

    releaseTicket() {
        if (this.queue.length) (this.queue.shift())();
        else this.current_depth--;
    }
 }