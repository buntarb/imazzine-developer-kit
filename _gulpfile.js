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

/**********************************************************************************************************************
 * File overview section                                                                                              *
 **********************************************************************************************************************/

/**
 * @fileoverview Declare project gulp tasks and watchers.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Dependencies section                                                                                               *
 **********************************************************************************************************************/

var CONST = require( './lib/constant.js' );
var gulp = require( 'gulp' );
var server = require( './lib/server.js' );
var compiler = require( './lib/compiler.js' );
var template = require( './lib/template.js' );
var filetools = require( './lib/filetools.js' );
var stylesheet = require( './lib/stylesheet.js' );
var documentation = require( './lib/documentation.js' );

/**********************************************************************************************************************
 * Functions declare section                                                                                          *
 **********************************************************************************************************************/

var locale = CONST.DEFAULTS.LOCALE;

/**
 * Start watchers processes.
 */
function watchFrontend( ){

	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.TEMPLATES + '/**/*', [
		'compile:soy'

	] ).on( 'change', function( evt ){

		template.compileTemplate( evt.path, locale );
	} );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.STYLESHEETS.ROOT +
		CONST.PATH.STYLESHEETS.SCSS + '/**/*', [
		'compile:gss'
	] );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.STYLESHEETS.ROOT +
		CONST.PATH.STYLESHEETS.GSS + '/' +
		filetools.getFileNameNoExt( CONST.FILE.ROOT_SCSS ) + '.css', [
		'compile:css'
	] );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.SOURCES.ROOT + '/base.js', [
		'compile:dep'
	] );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.SOURCES.ROOT + '/*/*.js', [
		'compile:dep'
	] );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.SOURCES.ROOT + '/*/*/*.js', [
		'compile:dep'
	] );
	gulp.watch(

		CONST.PATH.ROOT +
		CONST.PATH.SOURCES.ROOT + '/*/*/*/*.js', [
		'compile:dep'
	] );
}

/**********************************************************************************************************************
 * Gulp tasks declare section                                                                                         *
 **********************************************************************************************************************/

gulp.task( 'compile:msg', template.extractMessages );
gulp.task( 'compile:tpl', template.compileTemplates );
gulp.task( 'compile:soy', function(){} );
gulp.task( 'compile:gss', stylesheet.scss2gss );
gulp.task( 'compile:css', stylesheet.gss2css );
gulp.task( 'compile:dep', compiler.calculateDependencies );
gulp.task( 'compile:app', compiler.compileApplication );
gulp.task( 'compile:doc', documentation.generateDocumentation );
gulp.task( 'start:ws', server.startWebServer );
gulp.task( 'watch:fe', watchFrontend );

gulp.task( 'default', function( ){

	server.startWebServer( );
	watchFrontend( );
} );