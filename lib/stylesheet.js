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
 * @fileoverview Declare stylesheet commands.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var notifier = require( 'node-notifier' );
var yaml = require( 'yamljs' );
var gulp = require( 'gulp' );
var sass = require( 'gulp-sass' );
var ft = require( './filetools.js' );

/**
 * Compile stylesheets from .scss files to .gss files using gulp-sass utility.
 */
function scss2gss( ){

	notifier.notify( {

		'title': 'Stylesheets',
		'message': 'Compiling styles'
	} );
	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	gulp

		.src(  ft.getRootPath( ) + d +

			cfg.PATH.LIB + d +
			cfg.PATH.STYLESHEETS + d +
			cfg.PATH.SCSS + d +
			cfg.NAMESPACE + '.scss' )

		.pipe( sass( ) )
		.pipe(

			sass.sync( )

				.on( 'error', sass.logError ) )

		.pipe(

			gulp.dest( ft.getRootPath( ) + d +

				cfg.PATH.LIB + d +
				cfg.PATH.STYLESHEETS + d +
				cfg.PATH.CSS ) );
}

/**
 * Compile stylesheets from Closure Stylesheet format to .css files using Closure Tools utility.
 */
function gss2css( ){

	var d = ft.CONST.PATH_DELIMITER;
	var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
	var css;
	if( ft.isFileExist(

			ft.getRootPath( ) + d +
			cfg.PATH.LIB + d +
			cfg.PATH.STYLESHEETS + d +
			cfg.PATH.CSS + d +
			cfg.NAMESPACE + '.css' ) ){

		css = ft.openFile( ft.getRootPath( ) + d +

			cfg.PATH.LIB + d +
			cfg.PATH.STYLESHEETS + d +
			cfg.PATH.CSS + d +
			cfg.NAMESPACE + '.css' );

		if( css.indexOf( '@charset "UTF-8";' ) >= 0 ){

			css = css.replace( '@charset "UTF-8";', '' );
			ft.saveFile(

				ft.getRootPath( ) + d +
				cfg.PATH.LIB + d +
				cfg.PATH.STYLESHEETS + d +
				cfg.PATH.CSS + d +
				cfg.NAMESPACE + '.css',
				css );
		}
	}
	var cmd =

		'java -jar ' +

			ft.getIdkPath( ) + d +
			'bin' + d +
			'stylesheets' + d +
			'closure-stylesheets.jar ' +

		'--allow-unrecognized-functions ' +
		'--allow-unrecognized-properties ' +
		'--output-file ' +

			ft.getRootPath( ) + d +
			cfg.PATH.BIN + d +
			cfg.NAMESPACE +'.css ' +

		'--output-renaming-map-format CLOSURE_COMPILED ' +
		'--rename CLOSURE ' +
		'--output-renaming-map ' +

			ft.getRootPath( ) + d +
			cfg.PATH.LIB + d +
			cfg.PATH.SOURCES + d +
			'cssmap.js ' +

		ft.getRootPath( ) + d +
		cfg.PATH.LIB + d +
		cfg.PATH.STYLESHEETS + d +
		cfg.PATH.CSS + d +
		cfg.NAMESPACE + '.css';

	ft.execute( cmd );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	scss2gss: scss2gss,
	gss2css: gss2css
};