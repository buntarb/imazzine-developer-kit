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

var fs = require( "fs" );
var path = require( "path" );
var ft = require( './filetools.js' );

var tern = require( "../node_modules/tern/lib/tern" );
var minimatch = require("../node_modules/tern/node_modules/minimatch/minimatch");
var glob = require("../node_modules/tern/node_modules/glob/glob");

var d = ft.CONST.PATH_DELIMITER;

var projectFileName = ".tern-project";
var defaultConfig = {
    libs: [],
    loadEagerly: false,
    plugins: {doc_comment: true},
    ecmaScript: true,
    ecmaVersion: 6,
    dependencyBudget: tern.defaultOptions.dependencyBudget
};

// var distDir = path.resolve( __dirname, ".." );
var distDir = ft.getIdkPath() + d + ft.CONST.NODE_MODULE_FOLDER + d + 'tern';
// console.log('distDir = ' + distDir);

var disableLoadingLocal = process.argv.indexOf("--disable-loading-local") > -1;
// console.log('disableLoadingLocal = ' + disableLoadingLocal);
var verbose = process.argv.indexOf("--verbose") > -1;
// console.log('verbose = ' + verbose);
var debug = verbose || process.argv.indexOf("--debug") > -1;
// console.log('debug = ' + debug);
var stripCRs = process.argv.indexOf("--strip-crs") > -1;
// console.log('stripCRs = ' + stripCRs);

function findProjectDir( ) {

    var dir = process.cwd( );
    console.log('dir = ' + dir);

    for ( ;; ) {

        try {

            if ( fs.statSync( path.resolve( dir, projectFileName ) ).isFile( ) ){

                return dir;
            }
        } catch( e ) {console.log('ERR = ' + e);}

        var shorter = path.dirname( dir );
        if ( shorter == dir ) {

            return null;
        }
        dir = shorter;
    }
}

function readJSON( fileName ) {

    var file = fs.readFileSync( fileName, "utf8" );
    try {

        return JSON.parse( file );

    } catch ( e ) {

        console.error( "Bad JSON in " + fileName + ": " + e.message );
        process.exit(1);
    }
}

function mergeObjects( base, value ) {

    if ( !base ) return value;
    if ( !value ) return base;

    var result = {};
    for ( var prop in base ) result[prop] = base[prop];
    for ( var prop in value ) result[prop] = value[prop];

    return result;
}

function readProjectFile( fileName ) {

    var data = readJSON( fileName );
    for ( var option in defaultConfig ) {

        if ( !data.hasOwnProperty( option ) ){

            data[option] = defaultConfig[option];

        } else if (option == "plugins"){

            data[option] = mergeObjects( defaultConfig[option], data[option] );
        }
    }

    return data;
}

function findFile( file, projectDir, fallbackDir ) {

    var local = path.resolve( projectDir, file );

    if ( !disableLoadingLocal && fs.existsSync( local ) ) return local;

    var shared = path.resolve( fallbackDir, file );
    if ( fs.existsSync( shared ) ) return shared;
}

function findDefs( projectDir, config ) {

    var defs = [];
    var src = config.libs.slice( );

    if ( config.ecmaScript && src.indexOf( "ecmascript" ) == -1 ) {

        src.unshift( "ecmascript" );
    }

    console.log('src = ' + src);

    for ( var i = 0; i < src.length; ++i ) {

        var file = src[i];
        if (!/\.json$/.test(file)) {

            file = file + ".json";
            console.log('file = ' + file);
        }

        var found = findFile( file, projectDir, path.resolve(distDir, "defs") );
        //     || resolveFrom( projectDir, "tern-" + src[i] );

        console.log('found = ' + found);


        if ( !found ) {

            try {

                found = require.resolve( "tern-" + src[i] );

            } catch ( e ) {

                process.stderr.write( "Failed to find library " + src[i] + ".\n" );
                continue;
            }
        }

        if ( found ) defs.push( readJSON( found ) );
    }

    return defs;
}

function loadPlugins( projectDir, config ) {

    var plugins = config.plugins;
    var options = {};

    console.log('---plugins = ' + plugins);
    for(var p in plugins){
        console.log('--p = ' + p + ': ' + plugins[p]);
    }

    for ( var plugin in plugins ) {

        console.log('---plugin = ' + plugin);

        var val = plugins[plugin];
        if (!val) continue;

        var found = findFile( plugin + ".js", projectDir, path.resolve( distDir, "plugin" ) )
        // || resolveFrom(projectDir, "tern-" + plugin);

        if ( !found ) {
            try {

                found = require.resolve("tern-" + plugin);

            } catch ( e ) {

                process.stderr.write("Failed to find plugin " + plugin + ".\n");
                continue;
            }
        }

        var mod = require( found );
        console.log('---mod found = ' + found);
        console.log('---mod = ' + mod);
        for(var p in mod){
            console.log('--m = ' + p + ': ' + mod[p]);
        }

        if ( mod.hasOwnProperty( "initialize" ) ) mod.initialize( distDir );

        console.log('---path.basename( plugin ) = ' + path.basename( plugin ));
        options[path.basename( plugin )] = val;
    }

    return options;
}

function startTernServer( dir, config, httpServer ) {

    var defs = findDefs( dir, config );

    // console.log('defs = ' + defs);
    // for(var p in defs[0]){
    //     console.log('p = ' + p + ': ' + defs[0][p]);
    // }

    var plugins = loadPlugins( dir, config );

    console.log('plugins = ' + plugins);
    for(var p in plugins){
        console.log('p = ' + p + ': ' + plugins[p]);
    }
    for(var p in plugins['requirejs']){
        console.log('pRJs = ' + p + ': ' + plugins['requirejs'][p]);
    }

    var server = new tern.Server( {

        getFile: function( name, c ) {

            if ( config.dontLoad && config.dontLoad.some( function( pat ) { return minimatch( name, pat ); } ) ) {

                c(null, "");

            } else {

                fs.readFile( path.resolve( dir, name ), "utf8", c );
            }
        },
        normalizeFilename: function( name ) {

            var pt = path.resolve( dir, name );
            try {

                pt = fs.realPathSync( path.resolve( dir, name ), true );

            } catch( e ) {}

            return path.relative( dir, pt );
        },
        async: true,
        defs: defs,
        plugins: plugins,
        debug: debug,
        projectDir: dir,
        ecmaVersion: config.ecmaVersion,
        dependencyBudget: config.dependencyBudget,
        stripCRs: stripCRs,
        parent: {httpServer: httpServer}
    });

    if ( config.loadEagerly ) {

        config.loadEagerly.forEach( function( pat ) {

            glob.sync( pat, { cwd: dir } ).forEach( function( file ) {

                // console.log('============loadEagerly file = ' + file);

                server.addFile(file);
            });
        });
    }

    return server;
}

/**
 * Start IDE as WebSocket Server, WebSocket Service and...
 */
function startIde( ){

    // var projectDir = findProjectDir();
    // var config = defaultConfig;
    // if ( projectDir ) {
    //
    //     config = readProjectFile( path.resolve( projectDir, projectFileName ) );
    //
    // } else {
    //
    //     projectDir = process.cwd( );
    // }
    // console.log('projectDir = ' + projectDir);
    // console.log('config = ' + config);
    // for(var p in config){
    //     console.log('p = ' + p + ': ' + config[p]);
    // }
    // for(var p in config['plugins']){
    //     console.log('pPlug = ' + p + ': ' + config['plugins'][p]);
    // }
    //
    // var httpServer = undefined;
    // var ternServer = startTernServer(projectDir, config, httpServer);
    //
    // console.log('===========ternServer = ' + ternServer);
    // // for(var p in ternServer){
    // //     console.log('pTernServer = ' + p + ': ' + ternServer[p]);
    // // }
    //
    // var query = {type: "properties"};
    // ternServer.request( {query: query}, function( err, resp ) {
    //
    //     if (err) throw err;
    //
    //     var completionsLength = resp.completions.length;
    //
    //     console.log('----Init completions properties = ' + completionsLength );
    //     // console.log('----properties = ' + resp.completions );
    // });
    //
    // // query = {type: "files"};
    // // ternServer.request({query: query}, function(err, resp) {
    // //
    // //     if (err) throw err;
    // //
    // //     console.log('----files = ' + resp.files );
    // // });
    //
    // ternServer.addFile('/var/www/zz.ide/lib/sources/services/ftservice.js',
    //     fs.readFileSync( '/var/www/zz.ide/lib/sources/services/ftservice.js', "utf8" ));
    //
    // query = {
    //     type: "completions",
    //     end: {line: 91, ch: 52},
    //     file: 'lib/sources/services/ftservice.js',
    //     guess: true
    // };
    // ternServer.request({query: query}, function(err, resp) {
    //
    //     if (err) throw err;
    //
    //     console.log('|||----completions = ' + resp.completions );
    // });
    //
    //
    // // console.log('--------------ternServer.files = ' + ternServer.files );
    // // for( var p in ternServer.files ){
    // //     console.log('pF = ' + p + ': ' + ternServer.files[p]);
    // // }
    // // for( var p in ternServer.files[0] ){
    // //     console.log('pF0 = ' + p + ': ' + ternServer.files[0][p]);
    // // }
    // //
    // // var ast = ternServer.files[0].ast;
    // // console.log('--------------server.files[1].ast = ' + ast );
    // // for( var p in ast ){
    // //     console.log('p = ' + p + ': ' + ast[p]);
    // // }











    var express = require( 'express' );
    var vhost = require( 'vhost' );
    var notifier = require( 'node-notifier' );

    // var ft = require( './filetools.js' );
    // var d = ft.CONST.PATH_DELIMITER;

    var yaml = require( 'yamljs' );
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var wsHost = cfg.IDE.WS_SERVER_HOST;
    var wsPort = cfg.IDE.WS_SERVER_PORT;
    var wsPath = cfg.IDE.WS_SERVER_PATH;
    var wsUrl = 'ws://' + wsHost + ':' + wsPort + '/' + wsPath;

    var IdeServer = require( './ide/zz.ide.services.IdeServer.js' ).zz.ide.services.IdeServer;
    var FtService = require( './ide/zz.ide.services.FtService.js' ).zz.ide.services.FtService;

    var cluster = require( 'cluster' );

    if( cluster.isMaster ) {

        var ideServer = new IdeServer( wsHost, wsPort, wsPath );

        var numWorkers = require( 'os' ).cpus( ).length;
        console.log( 'Master cluster setting up ' + numWorkers + ' workers...' );

        for( var i = 0; i < numWorkers; i++ ) {

            var worker = cluster.fork( );

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

            cluster.fork();
        });

        /**
         * Start http server ide
         */

        var tpl = ft.openFile(

            ft.getIdkPath( ) + d +
            'lib' + d + 'ide' + d +
            'index.ide.html' );

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
    }
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    startIde: startIde
};