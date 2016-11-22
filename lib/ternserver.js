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
 * @fileoverview Get tern server API adapted for idk.
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

var disableLoadingLocal = process.argv.indexOf("--disable-loading-local") > -1;
var verbose = process.argv.indexOf("--verbose") > -1;
var debug = verbose || process.argv.indexOf("--debug") > -1;
var stripCRs = process.argv.indexOf("--strip-crs") > -1;

function findProjectDir( ) {

    var dir = process.cwd( );

    for ( ;; ) {

        try {

            if ( fs.statSync( path.resolve( dir, projectFileName ) ).isFile( ) ){

                return dir;
            }
        } catch( e ) {}

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

    for ( var i = 0; i < src.length; ++i ) {

        var file = src[i];
        if (!/\.json$/.test(file)) {

            file = file + ".json";
        }

        var found = findFile( file, projectDir, path.resolve(distDir, "defs") );
        //     || resolveFrom( projectDir, "tern-" + src[i] );

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

    for ( var plugin in plugins ) {

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
        if ( mod.hasOwnProperty( "initialize" ) ) mod.initialize( distDir );

        options[path.basename( plugin )] = val;
    }

    return options;
}

function getTernServer( ) {

    var httpServer = undefined;
    var dir = findProjectDir();
    var config = defaultConfig;
    if ( dir ) {

        config = readProjectFile( path.resolve( dir, projectFileName ) );

    } else {

        dir = process.cwd( );
    }

    var defs = findDefs( dir, config );
    var plugins = loadPlugins( dir, config );

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

                server.addFile(file);
            });
        });
    }

    return server;
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    getTernServer: getTernServer
};