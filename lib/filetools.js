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
 * @fileoverview IDK base file tools.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var fs = require( 'fs' );
var exec = require( 'child_process' ).execSync;
var yaml = require( 'yamljs' );

/**
 * Paths delimiter.
 * @type {string}
 */
var D = /windows/i.test( process.env.OS ) ? '\\' : '/';

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
 * Determine is specified file exist or not.
 * @param {string} fileName
 * @returns {Boolean}
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
 * @returns {Boolean}
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
 * Execute shell command.
 * @param {string} command
 * @type {Function}
 */
var execute = function( command ){

	try{

		exec( command );

	}catch( err ){

		console.log( err );
	}
};

/**
 * Open specified file and return its content.
 * @param {string} fileName
 * @returns {string}
 */
var openFile = function( fileName ){

	return fs.readFileSync( fileName, 'utf8' );
};

/**
 * Open yaml file and convert it to json object.
 * @param {string} yamlFile
 * @returns {JSON}
 */
var openYaml = function( yamlFile ){

	return yaml.load( yamlFile );
};

/**
 * Open JSON file and return JSON object.
 * @param {string} jsonFile
 * @returns {JSON}
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
 * @returns {string}
 */
var getRootPath = function( ){

	return __dirname
		.split( D + 'lib' )[ 0 ]
		.split( D + NODE_MODULE_FOLDER/* + D + IDK_FOLDER_NAME*/ )[ 0 ];
};

/**
 * Return IDK path.
 * @returns {string}
 */
var getIdkPath = function( ){

	return getRootPath( ) + D + NODE_MODULE_FOLDER + D + IDK_FOLDER_NAME;
};

/**
 * Return file name without ext.
 * @param {string} fullName
 * @returns {string}
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
 */

var getFilesRecursively = function( dirName ){

	var files = [ ];
	var list = fs.readdirSync( dirName );
	list.forEach( function( item ){

		item = dirName + '/' + item;
		if( isDirectoryExist( item ) ){

			files = files.concat( getFilesRecursively( item ) );
		}
		if( isFileExist( item ) ){

			files.push( item );
		}
	} );
	return files;
};

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	CONST: {

		PATH_DELIMITER: D,
		NODE_MODULE_FOLDER: NODE_MODULE_FOLDER,
		IDK_FOLDER_NAME: IDK_FOLDER_NAME
	},
	isDirExist: isDirectoryExist,
	isFileExist: isFileExist,
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
	getFilesRecursively: getFilesRecursively
};