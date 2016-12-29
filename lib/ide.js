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
 * @fileoverview Default idk IDE environment.
 */


/**
 * Start IDE as WebSocket Server, WebSocket Service and...
 */
function startIde( ){

    var express = require( 'express' );
    var vhost = require( 'vhost' );
    var notifier = require( 'node-notifier' );

    var ft = require( './filetools.js' );
    var d = ft.CONST.PATH_DELIMITER;
    var yaml = require( 'yamljs' );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var wsHost = cfg.IDE.WS_SERVER_HOST;
    var wsPort = cfg.IDE.WS_SERVER_PORT;
    var wsPath = cfg.IDE.WS_SERVER_PATH;
    var wsUrl = 'ws://' + wsHost + ':' + wsPort + '/' + wsPath;
    goog.require('goog.structs.Map');
    var regExpsMap = new goog.structs.Map();

    var cluster = require( 'cluster' );

    if( cluster.isMaster ) {

        var IdeServer = require( './ide/zz.ide.services.IdeServer.js' ).zz.ide.services.IdeServer;
        var ideServer = new IdeServer( wsHost, wsPort, wsPath );

        var ternServer = require( './ternserver' ).getTernServer( );
        var TernService = require( './ide/zz.ide.services.TernService.js' ).zz.ide.services.TernService;
        var ternService = new TernService( wsUrl, undefined, ternServer ) ;

        var webServer = require( './server' ).getWebServer( );
        var WebService = require( './ide/zz.ide.services.WebServerRunner.js' ).zz.ide.services.WebServerRunner;
        var webService = new WebService( wsUrl, undefined, webServer ) ;

        var numWorkers = require( 'os' ).cpus( ).length;
        console.log( 'Master cluster setting up ' + numWorkers + ' workers...' );

        for( var i = 0; i < numWorkers; i++ ) {

            var worker = cluster.fork( {
                ternServer: ternServer
            } );

            worker.on('message', function( message ){

                if( message.type === 'ping' ){

                    console.log( 'Master detected message: type = '
                        + message.type + '; from = ' + message.from + '; content = ' + message.data.content );
                }else{

                    console.log( 'Master detected message unknown type: ' + message.type );
                }
            });
        }

        cluster.on('online', function(worker) {

            console.log('Worker ' + worker.process.pid + ' is online');
        });

        for( var wid in cluster.workers ) {

            cluster.workers[ wid ].send( {

                type: 'ping',
                from: 'master',
                data: {
                    content: 'test ping from master'
                }
            });
        }

        /**
         * Restart worker if it has fell down
         */
        cluster.on( 'exit', function( worker, code, signal ) {

            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker...');

            cluster.fork( {
                ternServer: ternServer
            } );
        });

        /**
         * Start http server ide
         */

        var tpl = ft.openFile(

            ft.getIdkPath( ) + d +
                'lib' + d + 'ide' + d +
                'index.ide.html' );

        regExpsMap = ft.getSubstitutionsMap( cfg, '', regExpsMap );
        var valReArray = regExpsMap.getValues();
        for( var i = 0; i < valReArray.length; i++ ){

            tpl = tpl.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
        }

        var ideApp = express( );

        // routes
        ideApp
            .get( '/', function( req, res ){

                res.send( tpl );
            } )
            .get( '/favicon.ico', function( req, res ){

                res.status( 404 ).send( 'favicon.ico is not defined' );
            } );

        express( )

            .use( vhost( cfg.SERVER.SERVER_IDE + '.' + cfg.SERVER.SERVER_DOMAIN, ideApp ) )
            // redirect for test server js sources
            .use( ft.getRootPath( ), function( req, res, nxt ){

                res.redirect( req.originalUrl.replace( ft.getRootPath( ), '' ) );
            } )
            .use( express.static( ft.getRootPath( ) ), function( ){ } )
            .listen( cfg.SERVER.SERVER_IDE_PORT );

        notifier.notify( {

            'title': 'Server IDE',
            'message': 'Start at ' + cfg.SERVER.SERVER_DOMAIN + ':' + cfg.SERVER.SERVER_IDE_PORT
        } );

    } else {

        var FtService = require( './ide/zz.ide.services.FtService.js' ).zz.ide.services.FtService;
        var JSDocService = require( './ide/zz.ide.services.JSDocService.js' ).zz.ide.services.JSDocService;

        process.on( 'message', function(message) {

            if( message.type === 'ping' ) {

                console.log( 'Worker ' + process.pid + ' detected message: type = '
                    + message.type + '; from = ' + message.from + '; content = ' + message.data.content );

                process.send({

                    type:'ping',
                    from: 'Worker ' + process.pid,
                    data: {
                        content: 'ping response from worker ' + process.pid
                    }
                });
            }else{

                console.log( 'Worker ' + process.pid + ' detected message unknown type: ' + message.type );
            }
        });

        var ftService = new FtService( wsUrl ) ;
        var jsdocService = new JSDocService( wsUrl ) ;
    }
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    startIde: startIde
};