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
 * @fileoverview Declare compiler commands.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var notifier = require( 'node-notifier' );
var yaml = require( 'yamljs' );
var ft = require( './filetools.js' );
var modules = [ ];

/**
 * Return root paths for compile app cmd.
 * @param {string} mod_root
 * @returns {string}
 */
function getDepsRoot( mod_root ){

	var d = ft.CONST.PATH_DELIMITER;
	var res = '';
	var json = ft.openJson( mod_root + d + 'package.json' );
	for( var key in json.dependencies ){

		if( !~modules.indexOf( key ) && key !== 'imazzine-developer-kit' ){

			modules.push( key );
			res = res + '--root="';
			res = res +

				mod_root + d +
				'node_modules' + d +
				key + d +
				'lib' + d +
				'sources';
			res = res + '" ';
			res = res + getDepsRoot( mod_root + d + 'node_modules' + d + key );
		}
	}
	return res;
}

/**
 * Return root paths for calc deps cmd.
 * @param {string} mod_root
 * @returns {string}
 */
function getDepsWithPrefixRoot( mod_root ){

	var d = ft.CONST.PATH_DELIMITER;
	var res = '';
	var json = ft.openJson( mod_root + d + 'package.json' );
	for( var key in json.dependencies ){

		if( !~modules.indexOf( key ) && key !== 'imazzine-developer-kit' ){

			modules.push( key );
			res = res + '--root_with_prefix="';
			res = res +

				mod_root + d +
				'node_modules' + d +
				key + d +
				'lib' + d +
				'sources ' +

				'/../../../../../../..' +
				mod_root.split( ft.getRootPath( ) )[ 1 ] +
				'/node_modules/' +
				key + '/' +
				'lib/sources" ';
			res = res + getDepsWithPrefixRoot( mod_root + d + 'node_modules' + d + key );
		}
	}
	return res;
}

/**
 * Calculate application dependencies.
 */
function calculateDependencies( ){

	notifier.notify( {

		'title': 'Scripts',
		'message': 'Calculate dependencies'
	} );
	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	// Remove deps.js if exist.
	if( ft.isFileExist( ft.getRootPath( ) + d + 'deps.js' ) ){

		ft.removeFile( ft.getRootPath( ) + d + 'deps.js' );
	}
	var cmd =

		'python ' +

			ft.getIdkPath( ) + d +
			ft.CONST.NODE_MODULE_FOLDER + d +
			'google-closure-library' + d +
			'closure' + d +
			'bin' + d +
			'build' + d +
			'depswriter.py ' +

//		// Goog dependencies
//		'--root_with_prefix="' +
//
//			ft.getIdkPath( ) + d +
//			ft.CONST.NODE_MODULE_FOLDER + d +
//			'google-closure-library' + d +
//			'closure' + d +
//			'goog ' +
//			'/' + ft.CONST.NODE_MODULE_FOLDER +
//			'/google-closure-library/closure/goog/" ' +

		// Dependency modules
			getDepsWithPrefixRoot( ft.getRootPath( ) ) +

		// Module dependencies
		'--root_with_prefix="' +

			ft.getRootPath( ) + d +
			cfg.PATH.LIB + d +
			cfg.PATH.SOURCES +
			' /../../../../../../../lib/sources/" ' +

		'--output_file="' +

			ft.getRootPath( ) + d +
			cfg.PATH.LIB + d +
			cfg.PATH.SOURCES + d +
			'deps.js"';

	ft.execute( cmd );
	modules = [ ];
}

/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileApplication( ){

	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
	notifier.notify( {

		'title': 'Scripts',
		'message': 'Compiling application'
	} );
	if( ft.isFileExist( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js' ) ){

		ft.removeFile( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js' );
	}
	if( ft.isFileExist( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js.map' ) ){

		ft.removeFile( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js.map' )
	}
	var cmd =

		'python ' +

			ft.getIdkPath( ) + d +
			ft.CONST.NODE_MODULE_FOLDER + d +
			'google-closure-library' + d +
			'closure' + d +
			'bin' + d +
			'build' + d +
			'closurebuilder.py ' +

			// Google Closure Library root folder
			'--root=' +

				ft.getIdkPath( ) + d +
				ft.CONST.NODE_MODULE_FOLDER + d +
				'google-closure-library' + d +
				'closure' + d +
				'goog ' +

			// Google Closure Library Soy namespace
			'--root=' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'templates ' +

			// Google Closure Library Third Party root folder
			'--root=' +

				ft.getIdkPath( ) + d +
				ft.CONST.NODE_MODULE_FOLDER + d +
				'google-closure-library' + d +
				'third_party' + d +
				'closure' + d +
				'goog ' +

			// Module root folder
			'--root=' +

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.SOURCES + ' ' +

			// Dependency modules
			getDepsRoot( ft.getRootPath( ) ) +

			// Externs
			//'--compiler_flags="--externs=./sources/zz/_extern/gapi.js" ' +

			// Project namespace
			'--namespace="' + cfg.NAMESPACE + '" ' +

			// Compilation mode
			'--output_mode=compiled ' +

			// Compiler jar file
			'--compiler_jar=' +

				ft.getIdkPath( ) + d +
				'bin' + d +
				'compiler' + d +
				'compiler.jar ' +

			// CSS names map
			'--compiler_flags="--js=' +

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.SOURCES + d +
				'cssmap.js" ' +

			// DEBUG flag disabling
			'--compiler_flags="--define=\'goog.DEBUG=false\'" ' +

			// Source map versions
			'--compiler_flags="--source_map_format=V3" ' +

			// Compilation level
			'--compiler_flags="--compilation_level=' +

				srvCfg.COMPILATION.COMPILE_LEVEL + '" ' +

			// Incoming language version
			'--compiler_flags="--language_in=' +

				srvCfg.COMPILATION.INPUT_LANGUAGE + '" ' +

			// Result language version
			'--compiler_flags="--language_out=' +

				srvCfg.COMPILATION.OUTPUT_LANGUAGE + '" ' +

			// Output source map file
			'--compiler_flags="--create_source_map=' +

				ft.getRootPath( ) + d +
				cfg.PATH.BIN + d +
				cfg.NAMESPACE +'.js.map" ' +

			// Output app file
			'--compiler_flags="--js_output_file=' +

				ft.getRootPath( ) + d +
				cfg.PATH.BIN + d +
				cfg.NAMESPACE +'.js"';

	ft.execute( cmd );
	modules = [ ];
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	calculateDependencies: calculateDependencies,
	compileApplication: compileApplication
};

