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
 * @fileoverview Declare compiler commands.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Dependencies section                                                                                               *
 **********************************************************************************************************************/

var notifier = require( 'node-notifier' );
var CONST = require( './constant.js' );
var filetools = require( './filetools.js' );

/**********************************************************************************************************************
 * Functions declare section                                                                                          *
 **********************************************************************************************************************/

/**
 * Calculate application dependencies.
 */
function calculateDependencies( ){

	notifier.notify( {

		'title': 'Scripts',
		'message': 'Calculate dependencies'
	} );
	if( filetools.isFileExist( filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + '/' + CONST.FILE.DEPS_JS ) ) ){

		filetools.removeFile( filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + '/' + CONST.FILE.DEPS_JS ) );
	}
	var cmd =

		'python ' + CONST.TOOLS.CALCDEPS + ' ' +

			'--output_mode deps ' +
			'--dep ' + filetools.getAbsPath( CONST.PATH.GOOG.ROOT + CONST.PATH.GOOG.BASE ) + ' ' +
			'--path ' + filetools.getAbsPath( CONST.PATH.SOURCES.ROOT ) + ' > ' +
			filetools.getAbsPath( CONST.PATH.SOURCES.ROOT ) + '/' + CONST.FILE.DEPS_JS;

	filetools.execute( cmd );
}

/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileApplication( ){

	notifier.notify( {

		'title': 'Scripts',
		'message': 'Compiling application'
	} );
	if( filetools.isFileExist( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) ) ){

		filetools.removeFile( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) ); }

	if( filetools.isFileExist( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.MAP_JS ) ) ){

		filetools.removeFile( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.MAP_JS ) ); }

	var cmd =

		'python ' + CONST.TOOLS.BUILDER + ' ' +

			// Libraries root dirs
			'--root=' + filetools.getAbsPath( CONST.PATH.GOOG.ROOT + CONST.PATH.GOOG.BASE ) + ' ' +
			'--root=' + filetools.getAbsPath( CONST.PATH.GOOG.ROOT + CONST.PATH.GOOG.GOOG3P ) + ' ' +
			'--root=' + filetools.getAbsPath( CONST.PATH.SOURCES.ROOT ) + ' ' +

			// Externs
			//'--compiler_flags="--externs=./sources/zz/_extern/gapi.js" ' +

			// Project namespace
			'--namespace="' + CONST.DEFAULTS.NAMESPACE + '" ' +

			// Compiler settings
			'--output_mode=compiled ' +
			'--compiler_jar=' + CONST.TOOLS.COMPILER + ' ' +

			'--compiler_flags="--define=\'goog.DEBUG=false\'" ' +
			'--compiler_flags="--source_map_format=' + CONST.DEFAULTS.SOURCE_MAP + '" ' +
			'--compiler_flags="--compilation_level=' + CONST.DEFAULTS.COMPILE_LEVEL + '" ' +
			'--compiler_flags="--language_in=' + CONST.DEFAULTS.INPUT_LANGUAGE + '" ' +
			'--compiler_flags="--language_out=' + CONST.DEFAULTS.OUTPUT_LANGUAGE + '" ' +

			// Output file
			'--compiler_flags="--create_source_map=' +

				filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.MAP_JS ) + '" ' +

			'--compiler_flags="--js_output_file=' +

				filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) + '" ';

	filetools.execute( cmd );

	if( CONST.DEFAULTS.SOURCE_MAP_ENABLE &&
		filetools.isFileExist( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) ) ){

		var fileData = filetools.openFile( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) );
		fileData = fileData + '\n';
		fileData = fileData + '//@ sourceMappingURL=zz.js.map';
		filetools.saveFile( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ), fileData );
	}
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	calculateDependencies: calculateDependencies,
	compileApplication: compileApplication
};

