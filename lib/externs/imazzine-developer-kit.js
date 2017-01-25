// Copyright 2016 The Imazzine Developer Kit. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definitions for the imazzine-developer-kit module.
 * @author buntarb@gmail.com (Artem Lytvynov)
 * @externs
 */

/**
 BEGIN_NODE_INCLUDE
 var idk = require('imazzine-developer-kit');
 END_NODE_INCLUDE
 */

//noinspection FunctionWithInconsistentReturnsJS

/**
 *
 * @type {{ws: Function}}
 */
var idk = {

    /**
     * @type {Object}
     */
    filetools: {

        CONST: {

            PATH_DELIMITER: '',
            NODE_MODULE_FOLDER: '',
            IDK_FOLDER_NAME: '',
            IS_WINDOWS_OS: false
        },

        /**
         * Determine is specified directory exist or not.
         * @param {string} dirName
         * @return {boolean}
         */
        isDirExist: function( dirName ) {},

        /**
         * Determine is specified file exist or not.
         * @param {string} fileName
         * @return {boolean}
         */
        isFileExist: function( fileName ) {},

        /**
         * Create new directory.
         * @param {string} dir
         * @return {*}
         */
        createDir: function( dir ) {},

        /**
         * Execute shell command.
         * @param {string} command
         * @type {Function}
         * @return {*}
         */
        execute: function( command ) {},

        /**
         * Open specified file and return its content.
         * @param {string} fileName
         * @return {string}
         */
        openFile: function( fileName ) {},

        /**
         * Open yaml file and convert it to json object.
         * @param {string} yamlFile
         * @return {JSON}
         */
        openYaml: function( yamlFile ) {},

        /**
         * Open JSON file and return JSON object.
         * @param {string} jsonFile
         * @return {JSON}
         */
        openJson: function( jsonFile ) {},

        /**
         * Save specified data into specified file.
         * @param {string} fileName
         * @param {string} fileData
         */
        saveFile: function( fileName, fileData ) {},

        /**
         * Save json object as specified yaml file.
         * @param yamlName
         * @param json
         */
        saveYaml: function( yamlName, json ) {},

        /**
         * Save JSON object as specified file.
         * @param {string} jsonName
         * @param {JSON} json
         */
        saveJson: function( jsonName, json ) {},

        /**
         * Remove specified file.
         * @param fileName
         * @return {string} if is empty - there was no error
         */
        removeFile: function( fileName ) {},

        /**
         * Return project root absolute path.
         * @return {string}
         */
        getRootPath: function( ) {},

        /**
         * Return IDK path.
         * @return {string}
         */
        getIdkPath: function( ) {},

        /**
         * Return file name without ext.
         * @param {string} fullName
         * @return {string}
         */
        getFileNameNoExt: function( fullName ) {},

        /**
         * Recursive find all files in specified path.
         * @param {string} dirName
         * @return {Array.<string>}
         */
        getFilesRecursively: function( dirName ) {},

        /**
         * Copy file.
         * @param {string} fileNameFrom
         * @param {string} fileNameTo
         * @return {boolean}
         */
        copyFile: function( fileNameFrom , fileNameTo ) {},

        /**
         * Set file permission.
         * 4000 : Hidden File
         * 2000 : System File
         * 1000 : Archive bit
         * 0400 : Individual read
         * 0200 : Individual write
         * 0100 : Individual execute
         * 0040 : Group read
         * 0020 : Group write
         * 0010 : Group execute
         * 0004 : Other read
         * 0002 : Other write
         * 0001 : Other execute
         * Examples:
         * 0100
         * 0400 | 0200 | 0100 | 0040 | 0020 | 0004
         * @param {string} fileName
         * @param {number} mode
         */
        setFilePermission: function( fileName, mode ) {},

        /**
         * Create directories recursively.
         * @param {string} dir
         * @return {*}
         */
        createDirectoriesRecursively: function( dir ) {},

        /**
         * Get all files in specified path.
         * @param {string} dirName
         * @return {Array.<string>}
         */
        getFiles: function( dirName ) {},

        /**
         * Get Map for replace substitutes in templates with real values from configuration files.
         * @param {Object} objYaml
         * @param {string} stack
         * @param {goog.structs.Map} googMap
         * @return {goog.structs.Map}
         */
        getSubstitutionsMap: function( objYaml, stack, googMap ) {},

        /**
         * Get directories for specific path.
         * @param {string} path
         * @return {Array.<string>}
         */
        getDirectories: function( path ) {},

        /**
         * Transforming passed pseudo path into a real absolute path independently of OS.
         * @param {string} path is pseudo or absolute path.
         * 		moduleRoot in path param matches to a path for a module root.
         * 		idkRoot in path param matches to a path for a idk root.
         * 		Symbol / in path param matches to a path delimeter for current OS.
         * @return {string}
         */
        normalizePath: function( path ) {}
    },

    /**
     * @type {Object}
     */
    compiler: { },

    /**
     * @type {Object}
     */
    template: { },

    /**
     * @type {Object}
     */
    stylesheet: { },

    /**
     * @type {Object}
     */
    server: { },

    /**
     * @param {string} path
     * @return {ws.WebSocket}
     */
    ws: function( path ){ },

    /**
     * @type {Object}
     */
    ide: { },

    /**
     * @type {Object}
     */
    ternserver: {
        getTernServer: function( ){ }
    },

    /**
     * @type {Object}
     */
    mongoose: { }
};