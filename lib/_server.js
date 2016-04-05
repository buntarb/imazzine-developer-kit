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
 * @fileoverview Declare project gulp commands.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Dependencies section                                                                                               *
 **********************************************************************************************************************/

var gulp = require( 'gulp' );
var vhost = require( 'vhost' );
var express = require( 'express' );
var notifier = require( 'node-notifier' );
var CONST = require( './constant.js' );
var filetools = require( './filetools.js' );

/**********************************************************************************************************************
 * Functions declare section                                                                                          *
 **********************************************************************************************************************/

/**
 * Return compiled application object.
 * @returns {Object}
 */
function getAppServer( ){

	var app = express( );
	var css = filetools.openFile(

		filetools.getAbsPath( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.CSS ) + '/' +
		filetools.getFileNameNoExt( CONST.FILE.ROOT_SCSS ) + '.css' );

	var script = filetools.openFile( filetools.getAbsPath( CONST.PATH.APPLICATION + '/' + CONST.FILE.APP_JS ) );
	var tpl1 = CONST.TEMPLATE.APP1;

	// Template updating.
	tpl1 = tpl1.replace( '[{(TITLE)}]', CONST.DEFAULTS.TITLE );
	tpl1 = tpl1.replace( '[{(STYLE)}]', css );
	var tpl = tpl1 + script + CONST.TEMPLATE.APP2;

	// routes
	app.get( '/', function( req, res ){

		res.send( tpl );
	} );
	return app;
}

/**
 * Return test application object.
 * @returns {Object}
 */
function getTstServer( ){

	var app = express( );
	var css = filetools.openFile(

		filetools.getAbsPath( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.CSS ) + '/' +
			filetools.getFileNameNoExt( CONST.FILE.ROOT_SCSS ) + '.css' );

	var tpl = CONST.TEMPLATE.TST;

	// Template updating.
	tpl = tpl.replace( '[{(TITLE)}]', CONST.DEFAULTS.TITLE );
	tpl = tpl.replace( '[{(STYLE)}]', css );

	// routes
	app.get( '/', function( req, res ){

		res.send( tpl );
	} );
	return app;
}

/**
 * Return developer application object.
 * @returns {Object}
 */
function getDevServer( ){

	var app = express( );
	var tpl = CONST.TEMPLATE.DEV;

	// Template updating.
	tpl = tpl.replace( '[{(TITLE)}]', CONST.DEFAULTS.TITLE );

	// routes
	app.get( '/', function( req, res ){

		res.send( tpl );
	} );
	return app;
}

/**
 * Start web server on localhost:8080.
 */
function startWebServer( ){

	//noinspection JSCheckFunctionSignatures
	express( )

		.use( vhost( CONST.DEFAULTS.SERVER_APP + '.' + CONST.DEFAULTS.SERVER_DOMAIN, getAppServer( ) ) )
		.use( vhost( CONST.DEFAULTS.SERVER_TST + '.' + CONST.DEFAULTS.SERVER_DOMAIN, getTstServer( ) ) )
		.use( vhost( CONST.DEFAULTS.SERVER_DEV + '.' + CONST.DEFAULTS.SERVER_DOMAIN, getDevServer( ) ) )
		// redirect for test server js sources
		.use( CONST.PATH.ROOT, function( req, res, nxt ){

			res.redirect( req.originalUrl.replace( CONST.PATH.ROOT, '' ) );
		} )
		// redirect for css resources.
		.use( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.CSS + CONST.PATH.RESOURCES,

			function( req, res ){

				res.redirect( req.originalUrl.replace( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.CSS, '' ) );
			} )
		// redirect for gss resources.
		.use( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.GSS + CONST.PATH.RESOURCES,

			function( req, res ){

				res.redirect( req.originalUrl.replace( CONST.PATH.STYLESHEETS.ROOT + CONST.PATH.STYLESHEETS.GSS, '' ) );
			} )
		.use( express.static( CONST.PATH.ROOT ), function(){} )
		.listen( CONST.DEFAULTS.SERVER_PORT );

	notifier.notify( {

		'title': 'Server',
		'message': 'Start at ' + CONST.DEFAULTS.SERVER_DOMAIN + ':' + CONST.DEFAULTS.SERVER_PORT
	} );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	startWebServer: startWebServer
};