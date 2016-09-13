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
 * @fileoverview Declare commands for work with templates.
 */

var notifier = require( 'node-notifier' );
var yaml = require( 'yamljs' );
var ft = require( './filetools.js' );

/**
 * Return unique file prefix, based on file location.
 * @param {string} soyName
 * @private
 * @returns {string}
 */
function _getUniqueFilePrefix( soyName ){

	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	soyName = soyName.replace( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES + d, '' );
	soyName = soyName.split( d );
	soyName.pop( );
	return soyName.length ? soyName.join( '.' ) + '.' : '';

}

/**
 * Return XLF file name for specified SOY.
 * @param {string} soyName
 * @param {string} locale
 * @returns {string}
 * @private
 */
function _getXlfFileName( soyName, locale ){

	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	return ft.getRootPath( ) + d +
		cfg.PATH.LIB + d +
		cfg.PATH.MESSAGES + d +
		locale + d +
		_getUniqueFilePrefix( soyName ) + ft.getFileNameNoExt( soyName ) + '.xlf'
}

/**
 * Extract messages from .soy files to .xlf files using Closure Tools utility.
 * Target locale is default (does not create .xlf translate files with another language at all).
 */
var extractMessages = function( ){

	notifier.notify( {

		'title': 'Templates',
		'message': 'Extracting messages'
	} );
	var d = ft.CONST.PATH_DELIMITER;

	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	//var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
	var srvCfg = cfg;

	var files = ft.getFilesRecursively( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES );
	files.forEach( function( file ){

		var cmd =

			'java -jar ' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'messages' + d +
				'SoyMsgExtractor.jar ' +

			'--targetLocaleString ' +

				srvCfg.DEFAULT.LOCALE + ' ' +

			'--outputPathFormat ' +

				_getXlfFileName( file, srvCfg.DEFAULT.LOCALE ) + ' ' +

			file;

		ft.execute( cmd );
	} );
};

/**
 * Compile single .soy file with specified locale. Using default locale if not specified.
 * @param {string} fullName
 * @param {boolean} notify
 */
var compileTemplate = function( fullName, notify ){

	var cmd;
	var d = ft.CONST.PATH_DELIMITER;

	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	// var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
	var srvCfg = cfg;

	var file = _getUniqueFilePrefix( fullName ) + ft.getFileNameNoExt( fullName );
	var xlfFileName = false;
	if( ft.isFileExist( _getXlfFileName( fullName, srvCfg.COMPILATION.LOCALE ) ) ){

		xlfFileName = _getXlfFileName( fullName, srvCfg.COMPILATION.LOCALE );

	}else if( ft.isFileExist( _getXlfFileName( fullName, srvCfg.DEFAULT.LOCALE ) ) ){

		xlfFileName = _getXlfFileName( fullName, srvCfg.DEFAULT.LOCALE );
	}
	if( xlfFileName ){

		cmd =

			'java -jar ' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'templates' + d +
				'SoyToJsSrcCompiler.jar ' +

			'--shouldProvideRequireSoyNamespaces ' +
			'--codeStyle concat ' +
			'--cssHandlingScheme goog ' +
			'--shouldGenerateJsdoc ' +
			'--locales ' + srvCfg.COMPILATION.LOCALE + ' ' +
			'--messageFilePathFormat ' + xlfFileName + ' ' +
			'--outputPathFormat ' +

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.SOURCES + d +
				( cfg.PATH.COMPILED_SOY || '_tpl' ) + d +
				file + '.js ' +

			'--srcs ' + fullName;

	}else{

		cmd =

			'java -jar ' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'templates' + d +
				'SoyToJsSrcCompiler.jar ' +

			'--shouldProvideRequireSoyNamespaces ' +
			'--codeStyle concat ' +
			'--cssHandlingScheme goog ' +
			'--shouldGenerateJsdoc ' +
			'--outputPathFormat ' +

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.SOURCES + d +
				( cfg.PATH.COMPILED_SOY || '_tpl' ) + d +
				file + '.js ' +

			'--srcs ' + fullName;
	}
	if( notify ){

		notifier.notify( {

			'title': 'Templates',
			'message': 'Compiling ' + file + '.soy'
		} );
	}
	ft.execute( cmd );
};

/**
 * Compile project templates to .js files with specified locale.
 */
var compileTemplates = function( ){

	notifier.notify( {

		'title': 'Templates',
		'message': 'Compiling templates'
	} );
	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	if( ft.isDirExist( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES ) ){

		var files = ft.getFilesRecursively( ft.getRootPath( ) + d + cfg.PATH.LIB + d + cfg.PATH.TEMPLATES );
		files.forEach( function( file ){

			compileTemplate( file, false );
		} );
	}
};

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	extractMessages: extractMessages,
	compileTemplate: compileTemplate,
	compileTemplates: compileTemplates
};