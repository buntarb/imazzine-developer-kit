// Copyright 2016 Artem Lytvynov <buntarb@gmail.com>. All Rights Reserved.
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
 * @license Apache-2.0
 * @copyright Artem Lytvynov <buntarb@gmail.com>
 * @fileoverview IDK base file tools.
 */

var fs = require( 'fs' );
var exec = require( 'child_process' ).execSync;
var yaml = require( 'yamljs' );

/**
 * @type {boolean}
 */
var IS_WINDOWS_OS = /windows/i.test( process.env.OS );

/**
 * Paths delimiter.
 * @type {string}
 */
var D = IS_WINDOWS_OS ? '\\' : '/';

/**
 * Node.js modules folder name.
 * @type {string}
 */
var NODE_MODULE_FOLDER = 'node_modules';

/**
 * Imazzine Developer Kit root folder name.
 * @type {string}
 */
var IDK_FOLDER_NAME = 'imazzine-developer-kit';

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
var setFilePermission = function( fileName, mode ){

    fs.chmodSync(fileName, mode);
};

/**
 * Copy file.
 * @param {string} fileNameFrom
 * @param {string} fileNameTo
 * @return {boolean}
 */
var copyFile = function( fileNameFrom , fileNameTo ){

    try{

        saveFile( fileNameTo, openFile( fileNameFrom ));
        return isFileExist(fileNameTo);

    }catch( err ){}

    return false;
};

/**
 * Determine is specified file exist or not.
 * @param {string} fileName
 * @return {boolean}
 */
var isFileExist = function( fileName ){

    var exist;
    try{

        exist = fs.statSync( fileName ).isFile( );

    }catch( err ){

        exist = false;

    }
    return exist;
};

/**
 * Determine is specified directory exist or not.
 * @param {string} dirName
 * @return {boolean}
 */
var isDirectoryExist = function( dirName ){

    var exist;
    try{

        exist = fs.statSync( dirName ).isDirectory( );

    }catch( err ){

        exist = false;

    }
    return exist;
};

/**
 * Create new directory.
 * @param {string} dir
 * @return {*}
 */
var createDirectory = function( dir ){

    return fs.mkdirSync( dir );
};

/**
 * Create directories recursively.
 * @param {string} dir
 * @return {*}
 */
var createDirectoriesRecursively = function( dir ){

    var result;

    try{

        result = fs.mkdirSync( dir );

    }catch( e ){

        if( e.code === 'ENOENT' ){

            createDirectoriesRecursively( require('path').dirname( dir ) );
            result = fs.mkdirSync( dir );

        }else{

            throw e;
        }
    }

    return result;
};

/**
 * Execute shell command.
 * @param {string} command
 * @type {Function}
 * @return {*}
 */
var execute = function( command ){

    try{

        return exec( command );

    }catch( err ){

        console.log( err );
    }

    return null;
};

/**
 * Open specified file and return its content.
 * @param {string} fileName
 * @return {string}
 */
var openFile = function( fileName ){

    return fs.readFileSync( fileName, 'utf8' );
};

/**
 * Open yaml file and convert it to json object.
 * @param {string} yamlFile
 * @return {JSON}
 */
var openYaml = function( yamlFile ){

    return yaml.load( yamlFile );
};

/**
 * Open JSON file and return JSON object.
 * @param {string} jsonFile
 * @return {JSON}
 */
var openJson = function( jsonFile ){

    return JSON.parse( openFile( jsonFile ) );
};

/**
 * Save specified data into specified file.
 * @param {string} fileName
 * @param {string} fileData
 */
var saveFile = function( fileName, fileData ){

    fs.writeFileSync( fileName, fileData, 'utf8' );
};

/**
 * Save json object as specified yaml file.
 * @param yamlName
 * @param json
 */
var saveYaml = function( yamlName, json ){

    saveFile( yamlName, yaml.stringify( json ) );
};

/**
 * Save JSON object as specified file.
 * @param {string} jsonName
 * @param {JSON} json
 */
var saveJson = function( jsonName, json ){

    saveFile( jsonName, JSON.stringify( json ) );
};

/**
 * Remove specified file.
 * @param fileName
 */
var removeFile = function( fileName ){

    try{

        fs.unlinkSync( fileName );

    }catch( err ){

        console.log( err );
    }
};

/**
 * Return project root absolute path.
 * @return {string}
 */
var getRootPath = function( ){

    return __dirname
        .split( D + 'lib' )[ 0 ]
        .split( D + NODE_MODULE_FOLDER/* + D + IDK_FOLDER_NAME*/ )[ 0 ];
};

/**
 * Return IDK path.
 * @return {string}
 */
var getIdkPath = function( ){

    return getRootPath( ) + D + NODE_MODULE_FOLDER + D + IDK_FOLDER_NAME;
};

/**
 * Return file name without ext.
 * @param {string} fullName
 * @return {string}
 */
var getFileNameNoExt = function( fullName ){

    var tmp = fullName.split( D );
    tmp = tmp[ tmp.length - 1 ].split( '.' );
    tmp.pop( );
    return tmp.join( '.' );
};

/**
 * Recursive find all files in specified path.
 * @param {string} dirName
 * @return {Array.<string>}
 */
var getFilesRecursively = function( dirName ){

    var files = [ ];
    var list = fs.readdirSync( dirName );
    list.forEach( function( item ){

        item = dirName + D + item;
        if( isDirectoryExist( item ) ){

            files = files.concat( getFilesRecursively( item ) );
        }else if( isFileExist( item ) ){

            files.push( item );
        }
    } );
    return files;
};

/**
 * Get all files in specified path.
 * @param {string} dirName
 * @return {Array.<string>}
 */
var getFiles = function( dirName ){

    var files = [ ];

    if( isDirectoryExist( dirName ) ) {
        var list = fs.readdirSync(dirName);
        list.forEach(function (item) {

            item = dirName + D + item;
            if (isFileExist(item)) {

                files.push(item);
            }
        });
    }

    return files;
};

/**
 * Get directories for specific path.
 * @param {string} path
 * @return {Array.<string>}
 */
var getDirectories = function( path ){

    var dirs = [ ];

    if( isDirectoryExist( path ) ){

        var list = fs.readdirSync( path );
        list.forEach( function( item ){

            item = path + D + item;
            if( isDirectoryExist( item ) ){

                dirs.push( item );
            }
        } );
    }

    return dirs;
};

/**
 * Get Map for replace substitutes in templates with real values from configuration files.
 * @param {Object} objYaml
 * @param {string} stack
 * @param {goog.structs.Map} googMap
 * @return {goog.structs.Map}
 */
function getRegExpsMapForReplace( objYaml, stack, googMap ){

    for( var property in objYaml ){

        if( objYaml.hasOwnProperty( property ) ){

            if ( typeof objYaml[property] == "object" ){

                var key = ( ( stack + '.' + property ).substring( 1 ) );
                googMap.set( key,
                    {
                        value: JSON.stringify(objYaml[property], null, 8).replace( /"/g , ''),
                        re: new RegExp(  '\\[\\{\\(' + key + '\\)\\}\\]' , 'g' )
                    } );

                getRegExpsMapForReplace( objYaml[property], stack + '.' + property, googMap );

            } else {

                var key = ( ( stack + '.' + property ).substring( 1 ) );
                googMap.set( key,
                    {
                        value: JSON.stringify(objYaml[property], null, 8).replace( /"/g , ''),
                        re: new RegExp(  '\\[\\{\\(' + key + '\\)\\}\\]' , 'g' )
                    } );
            }
        }
    }

    return googMap;
}

/**
 * Transforming passed pseudo path into a real absolute path independently of OS.
 * @param {string} path is pseudo or absolute path.
 * 		moduleRoot in path param matches to a path for a module root.
 * 		idkRoot in path param matches to a path for a idk root.
 * 		Symbol / in path param matches to a path delimeter for current OS.
 * @return {string}
 */
function normalizePath( path ) {

    return path.replace( /\//g, D )
        .replace( /moduleRoot/g, getRootPath() )
        .replace( /idkRoot/g, getIdkPath() );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    CONST: {

        PATH_DELIMITER: D,
        NODE_MODULE_FOLDER: NODE_MODULE_FOLDER,
        IDK_FOLDER_NAME: IDK_FOLDER_NAME,
        IS_WINDOWS_OS: IS_WINDOWS_OS
    },
    isDirExist: isDirectoryExist,
    isFileExist: isFileExist,
    createDir: createDirectory,
    execute: execute,
    openFile: openFile,
    openYaml: openYaml,
    openJson: openJson,
    saveFile: saveFile,
    saveYaml: saveYaml,
    saveJson: saveJson,
    removeFile: removeFile,
    getRootPath: getRootPath,
    getIdkPath: getIdkPath,
    getFileNameNoExt: getFileNameNoExt,
    getFilesRecursively: getFilesRecursively,
    copyFile: copyFile,
    setFilePermission: setFilePermission,
    createDirectoriesRecursively: createDirectoriesRecursively,
    getFiles: getFiles,
    getSubstitutionsMap: getRegExpsMapForReplace,
    getDirectories: getDirectories,
    normalizePath: normalizePath
};