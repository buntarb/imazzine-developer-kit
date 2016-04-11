// Copyright 2005 The Imazzine Developer Kit. All Rights Reserved.
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
 * @fileoverview Declare commands for work with templates.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var notifier = require( 'node-notifier' );
var yaml = require( 'yamljs' );
var ft = require( './filetools.js' );

/**
 * Extract messages from .soy files to .xlf files using Closure Tools utility.
 * Target locale is default (does not create .xlf translate files with another language at all).
 */
var extractMessages = function( ){

	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
	notifier.notify( {

		'title': 'Templates',
		'message': 'Extracting messages'
	} );
	var files = ft.getFilesRecursively( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES );
	files.forEach( function( file ){

		var cmd =

			'java -jar ' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'messages' + d +
				'SoyMsgExtractor.jar ' +

			'--targetLocaleString ' +

				srvCfg.COMPILATION.LOCALE + ' ' +

			'--outputPathFormat ' +

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.MESSAGES + d +
				srvCfg.DEFAULT.LOCALE + d +
				( function( f ){

					f = f.replace( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES + d, '' );
					f = f.split( d );
					f.pop( );
					return f.length ? f.join( '.' ) + '.' : '';

				} )( file ) +
				'{INPUT_FILE_NAME_NO_EXT}.xlf ' +

			file;

		ft.execute( cmd );
	} );
};

/**
 * Compile single .soy file with specified locale. Using default locale if not specified.
 * @param {String} fullName
 * @param {String=} locale
 */
var compileTemplate = function( fullName, locale ){

	locale = locale && typeof locale === 'string' ? locale : CONST.DEFAULTS.LOCALE;

	var cmd;
	var file = filetools.getFileNameNoExtTplPrefix( fullName ) + '.' + filetools.getFileNameNoExt( fullName );
	if( filetools.isFileExist( filetools.getAbsPath( CONST.PATH.MESSAGES ) + '/' + locale + '/' + file + '.xlf' ) ){

		cmd =

			'java -jar ' + CONST.TOOLS.TEMPLATES + ' ' +

				'--shouldProvideRequireSoyNamespaces ' +
				'--codeStyle concat ' +
				'--cssHandlingScheme goog ' +
				'--shouldGenerateJsdoc ' +
				'--locales ' + locale + ' ' +
				'--messageFilePathFormat ' +

					filetools.getAbsPath( CONST.PATH.MESSAGES ) + '/' +
					locale + '/' +
					file + '.xlf ' +

				'--outputPathFormat ' +

					filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.TEMPLATE ) + '/js/' +
					file + '.js ' +

				'--srcs ' + fullName;

	}else{

		cmd =

			'java -jar ' + CONST.TOOLS.TEMPLATES + ' ' +

				'--shouldProvideRequireSoyNamespaces ' +
				'--codeStyle concat ' +
				'--cssHandlingScheme goog ' +
				'--shouldGenerateJsdoc ' +
				'--outputPathFormat ' +

					filetools.getAbsPath( CONST.PATH.SOURCES.ROOT + CONST.PATH.SOURCES.TEMPLATE ) + '/js/' +
					file + '.js ' +

				'--srcs ' + fullName;
	}
	notifier.notify( {

		'title': 'Templates',
		'message': 'Compiling ' + file + '.soy'
	} );
	filetools.execute( cmd );
};

/**
 * Compile project templates to .js files with specified locale.
 * @param {String} locale
 */
var compileTemplates = function( locale ){

	var files = filetools.getFilesRecursively( filetools.getAbsPath( CONST.PATH.TEMPLATES ) );
	files.forEach( function( file ){

		compileTemplate( file, locale && typeof locale === 'string' ? locale : CONST.DEFAULTS.LOCALE );
	} );
};

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	extractMessages: extractMessages,
	compileTemplate: compileTemplate,
	compileTemplates: compileTemplates
};