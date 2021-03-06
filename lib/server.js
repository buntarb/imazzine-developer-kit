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
 * @fileoverview Declare developer server commands.
 */

var yaml = require( 'yamljs' );
var vhost = require( 'vhost' );
var express = require( 'express' );
var notifier = require( 'node-notifier' );
var ft = require( './filetools.js' );

require( 'google-closure-library' );
goog.require('goog.structs.Map');

var regExpsMap = new goog.structs.Map();


/**
 * Return compiled application object.
 * @return {Object}
 */
function getAppServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var app = express( );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var css = ft.openFile(

        ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.css' );

    var script = ft.openFile(

        ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.js' );

    var tpl1 = ft.openFile(

        ft.getRootPath( ) + d +
            'srv' + d +
            'index.app.header.tpl' );

    // Template updating.
    // tpl1 = tpl1.replace(
    // 	/\[\{\(NAMESPACE\)\}\]/g,
    // 	cfg.NAMESPACE + '' );

    var tpl2 = ft.openFile(

        ft.getRootPath( ) + d +
            'srv' + d +
            'index.app.footer.tpl' );

    // Template updating.
    // tpl2 = tpl2.replace(
    // 	/\[\{\(NAMESPACE\)\}\]/g,
    // 	cfg.NAMESPACE + '' );

    // Templates updating.
    var valReArray = regExpsMap.getValues();
    for( var i = 0; i < valReArray.length; i++ ){

        tpl1 = tpl1.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
        tpl2 = tpl2.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    }

    // Template updating.
    tpl1 = tpl1.replace( '[{(STYLE)}]', css );
    var tpl = tpl1 + script + tpl2;

    // routes
    app
        .get( '/', function( req, res ){

            res.send( tpl );
        } )
        .get( '/favicon.ico', function( req, res ){

            res.status( 404 ).send( 'favicon.ico is not defined' );
        } );
    return app;
}

/**
 * Return test application object.
 * @return {Object}
 */
function getTstServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var app = express( );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var tpl = ft.openFile(

        ft.getRootPath( ) + d +
            'srv' + d +
            'index.tst.tpl' );

    // Template updating.
    // tpl = tpl.replace(
    // 	/\[\{\(NAMESPACE\)\}\]/g,
    // 	cfg.NAMESPACE + '' );
    var valReArray = regExpsMap.getValues();
    for( var i = 0; i < valReArray.length; i++ ){

        tpl = tpl.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    }

    // routes
    app
        .get( '/', function( req, res ){

            res.send( tpl );
        } )
        .get( '/favicon.ico', function( req, res ){

            res.status( 404 ).send( 'favicon.ico is not defined' );
        } );
    return app;
}

/**
 * Return developer application object.
 * @return {Object}
 */
function getDevServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var app = express( );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var tpl = ft.openFile(

        ft.getRootPath( ) + d +
            'srv' + d +
            'index.dev.tpl' );

    // Template updating.
    // tpl = tpl.replace(
    // 	/\[\{\(NAMESPACE\)\}\]/g,
    // 	cfg.NAMESPACE + '' );
    var valReArray = regExpsMap.getValues();
    for( var i = 0; i < valReArray.length; i++ ){

        tpl = tpl.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    }

    // routes
    app
        .get( '/', function( req, res ){

            res.send( tpl );
        } )
        .get( '/favicon.ico', function( req, res ){

            res.status( 404 ).send( 'favicon.ico is not defined' );
        } );
    return app;
}

/**
 * Return documentation application object.
 * @return {Object}
 */
function getDocServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var app = express( );

    // var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    // var tpl = ft.openFile(
    //
    // 	ft.getRootPath( ) + d +
    // 	'srv' + d +
    // 	'index.doc.tpl' );
    //
    // var valReArray = regExpsMap.getValues();
    // for( var i = 0; i < valReArray.length; i++ ){
    //
    // 	tpl = tpl.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    // }

    // routes
    app
        .use( express.static( ft.getRootPath( ) + d + 'doc' ), function( ){ } )
        // .get( '/', function( req, res ){
        //
        // 	res.send( tpl );
        // } )
        .get( '/favicon.ico', function( req, res ){

            res.status( 404 ).send( 'favicon.ico is not defined' );
        } );
    return app;
}

/**
 * Return Unit Test application object.
 * @return {Object}
 */
function getUtServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var app = express( );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var tpl = ft.openFile(

        ft.getRootPath( ) + d +
            'srv' + d +
            'index.ut.tpl' );

    var valReArray = regExpsMap.getValues();
    for( var i = 0; i < valReArray.length; i++ ){

        tpl = tpl.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    }

    // routes
    app
        .get( '/', function( req, res ){

            res.send( tpl );
        } )
        .get( '/favicon.ico', function( req, res ){

            res.status( 404 ).send( 'favicon.ico is not defined' );
        } );
    return app;
}

/**
 * Start web server on localhost:8080.
 */
function startWebServer( ){

    var srvCfg = yaml.load( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );

    getWebServer( ).listen( srvCfg.SERVER.SERVER_PORT );

    notifier.notify( {

        'title': 'Server',
        'message': 'Start at ' + srvCfg.SERVER.SERVER_DOMAIN + ':' + srvCfg.SERVER.SERVER_PORT
    } );
}

/**
 * Get web server.
 */
function getWebServer( ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var srvCfg = cfg;

    regExpsMap = ft.getSubstitutionsMap( cfg, '', regExpsMap );

    var webServer = express( )

        .use( vhost( srvCfg.SERVER.SERVER_APP + '.' + srvCfg.SERVER.SERVER_DOMAIN, getAppServer( ) ) )
        .use( vhost( srvCfg.SERVER.SERVER_TST + '.' + srvCfg.SERVER.SERVER_DOMAIN, getTstServer( ) ) )
        .use( vhost( srvCfg.SERVER.SERVER_DEV + '.' + srvCfg.SERVER.SERVER_DOMAIN, getDevServer( ) ) )
        .use( vhost( srvCfg.SERVER.SERVER_DOC + '.' + srvCfg.SERVER.SERVER_DOMAIN, getDocServer( ) ) )
        .use( vhost( srvCfg.SERVER.SERVER_UT  + '.' + srvCfg.SERVER.SERVER_DOMAIN, getUtServer( ) ) )
        .use( ft.getRootPath( ), function( req, res, nxt ){

            res.redirect( req.originalUrl.replace( ft.getRootPath( ), '' ) );
        } )
        .use( express.static( ft.getRootPath( ) ), function( ){ } );

    return webServer;
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    startServer: startWebServer,
    getWebServer: getWebServer
};