// Copyright 2005 The ZZ Library Authors. All Rights Reserved.
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

/**********************************************************************************************************************
 * File overview section                                                                                              *
 **********************************************************************************************************************/

/**
 * @fileoverview Tools for work with files.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Dependencies section                                                                                               *
 **********************************************************************************************************************/

var fs = require( 'fs' );
var exec = require( 'child_process' ).execSync;
var CONST = require( './constant' );

/**********************************************************************************************************************
 * Functions declare section                                                                                          *
 **********************************************************************************************************************/

/**
 * Determine is specified file exist or not.
 * @param {String} fileName
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
 * @param {String} dirName
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
 * @param {String} command
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
 * @param {String} fileName
 * @returns {String}
 */
var openFile = function( fileName ){

	return fs.readFileSync( fileName, 'utf8' );
};

/**
 * Save specified data into specified file.
 * @param {String} fileName
 * @param {String} fileData
 */
var saveFile = function( fileName, fileData ){

	fs.writeFileSync( fileName, fileData, 'utf8' );
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
 * Return absolute path of specified related path based on project constants.
 * @param {String} relPath
 * @returns {String}
 */
var getAbsPath = function( relPath ){

	return CONST.PATH.ROOT + relPath;
};

/**
 * Return file name without ext.
 * TODO: Update this function.
 * @param {String} fullName
 * @returns {string}
 */
var getFileNameNoExt = function( fullName ){

	var tmp = fullName.split( CONST.IS_WINDOWS ? '\\' : '/' );
	tmp = tmp[ tmp.length - 1 ].split( '.' );
	tmp.pop( );
	return tmp.join( '.' );
};

/**
 * Return unique prefix for .soy file based on file path.
 * @param {string} fullName
 * @returns {string}
 */
var getFileNameNoExtTplPrefix = function( fullName ){

	fullName = fullName.replace( getAbsPath( CONST.PATH.TEMPLATES ) + '/', '' );
	var tmp = fullName.split( CONST.IS_WINDOWS ? '\\' : '/' );
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

	isDirExist: isDirectoryExist,
	isFileExist: isFileExist,
	execute: execute,
	openFile: openFile,
	saveFile: saveFile,
	removeFile: removeFile,
	getAbsPath: getAbsPath,
	getFileNameNoExt: getFileNameNoExt,
	getFileNameNoExtTplPrefix: getFileNameNoExtTplPrefix,
	getFilesRecursively: getFilesRecursively
};