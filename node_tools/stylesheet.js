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
 * @fileoverview Declare stylesheet commands.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Dependencies section                                                                                               *
 **********************************************************************************************************************/

var gulp = require( 'gulp' );
var sass = require( 'gulp-sass' );
var notifier = require( 'node-notifier' );
var CONST = require( './constant.js' );
var filetools = require( './filetools.js' );

/**********************************************************************************************************************
 * Functions declare section                                                                                          *
 **********************************************************************************************************************/

/**
 * Compile stylesheets from .scss files to .gss files using gulp-sass utility.
 */
function scss2gss( ){

	notifier.notify( {

		'title': 'Stylesheets',
		'message': 'Compiling styles'
	} );
	//noinspection JSUnresolvedVariable
	gulp.src( filetools.getAbsPath(

			CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.SCSS + '/' + CONST.FILE.ROOT_SCSS ) )

		.pipe( sass( ) )
		.pipe( sass.sync( ).on( 'error', sass.logError ) )
		.pipe( gulp.dest( filetools.getAbsPath( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.GSS ) ) );
}

/**
 * Compile stylesheets from Closure Stylesheet format to .css files using Closure Tools utility.
 */
function gss2css( ){

	var fileData;
	var fileName = filetools.getAbsPath(

		CONST.PATH.STYLESHEETS.ROOT +
		CONST.PATH.STYLESHEETS.GSS + '/' +
		filetools.getFileNameNoExt( CONST.FILE.ROOT_SCSS ) + '.css' );

	if( filetools.isFileExist( fileName ) ){

		fileData = filetools.openFile( fileName );
		if( fileData.indexOf( '@charset "UTF-8";' ) >= 0 ){

			fileData = fileData.replace( '@charset "UTF-8";', '' );
			filetools.saveFile( fileName, fileData );
		}
	}
	var cmd =

		'java -jar ' + CONST.TOOLS.STYLESHEETS + ' ' +

			'--allow-unrecognized-functions ' +
			'--allow-unrecognized-properties ' +
			'--output-file ' +

				filetools.getAbsPath( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.CSS ) + '/' +
				filetools.getFileNameNoExt( CONST.FILE.ROOT_SCSS ) + '.css' + ' ' +

			'--output-renaming-map-format CLOSURE_COMPILED ' +
			'--rename CLOSURE ' +
			'--output-renaming-map ' +

				filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.STYLESHEET ) + '/' +
				CONST.FILE.REMAP_DAT + ' ' +

			fileName;

	filetools.execute( cmd );
	cmd =

		'cat ' +

			filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.STYLESHEET ) + '/' +
			CONST.FILE.REMAP_TPL + ' ' +

			filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.STYLESHEET ) + '/' +
			CONST.FILE.REMAP_DAT + ' ' +

			filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.STYLESHEET ) + '/' +
			CONST.FILE.REMAP1_TPL + ' >' +

			filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.STYLESHEET ) + '/' +
			CONST.FILE.REMAP_JS;

	filetools.execute( cmd );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	scss2gss: scss2gss,
	gss2css: gss2css
};