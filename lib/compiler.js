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
var template = require( './template.js' );
var stylesheet = require( './stylesheet.js' );

require( 'google-closure-library' );
goog.require( 'goog.object' );

var childProcessSync = require('child_process').spawnSync;

var modulesMap = { };

/**
 * Return true if {@code name} is supported by IDK node module.
 * @param {string} name
 * @returns {boolean}
 */
function isSupportedNodePackage( name ){

    return name === 'imazzine-developer-kit' ||

        name === 'ws';
}

/**
 * Return root paths array for compile app cmd.
 * @param {string} mod_root
 * @returns {Array}
 */
function getDepsRootArray( mod_root ){

    var d = ft.CONST.PATH_DELIMITER;
    var res = [];
    var json = ft.openJson( mod_root + d + 'package.json' );

    for( var key in json.dependencies ){

        if( !isSupportedNodePackage( key ) && ( !modulesMap.hasOwnProperty( key ) || modulesMap[key] !== 0 ) ){

            var nextModule = mod_root + d + 'node_modules' + d + key;
            modulesMap[key] = nextModule + d + 'package.json';

            if( ft.isFileExist( nextModule + d + 'package.json' ) ) {

                res.push( '--root=' + mod_root + d +
                    'node_modules' + d +
                    key + d +
                    'lib' + d +
                    'sources' );

                res = res.concat( getDepsRootArray( nextModule ) );
                modulesMap[key] = 0;

            }else{

                var seeUp = mod_root.lastIndexOf( 'node_modules' ) >= 0;

                if( seeUp ){

                    var rootUp = mod_root.substring( 0, mod_root.lastIndexOf('node_modules') + 12 );

                    while( seeUp ){

                        if( ft.isFileExist( rootUp + d + key + d + 'package.json' ) ){

                            seeUp = false;

                            res.push( '--root=' + rootUp + d +
                                key + d +
                                'lib' + d +
                                'sources' );

                            res = res.concat( getDepsRootArray( rootUp + d + key ) );
                            modulesMap[key] = 0;

                            break;
                        }

                        rootUp = rootUp.substring( 0, rootUp.lastIndexOf( 'node_modules' ) );
                        seeUp = rootUp.lastIndexOf( 'node_modules' ) >= 0;
                        if( seeUp ){

                            rootUp = rootUp.substring( 0, rootUp.lastIndexOf( 'node_modules' ) + 12 );
                        }
                    }
                }

            }
        }
    }
    return res;
}

/**
 * Return root paths array for calc deps cmd.
 * @param {string} mod_root
 * @param {boolean=} is_node
 * @returns {Array}
 */
function getDepsWithPrefixRootArray( mod_root, is_node ){

    var d = ft.CONST.PATH_DELIMITER;
    var res = [];
    var json = ft.openJson( mod_root + d + 'package.json' );

    for( var key in json.dependencies ){

        if( !isSupportedNodePackage( key ) && ( !modulesMap.hasOwnProperty( key ) || modulesMap[key] !== 0 ) ){

            var nextModule = mod_root + d + 'node_modules' + d + key;
            modulesMap[key] = nextModule + d + 'package.json';

            if( ft.isFileExist( nextModule + d + 'package.json' ) ) {

                res.push( '--root_with_prefix=' + mod_root + d +
                    'node_modules' + d +
                    key + d +
                    'lib' + d +
                    'sources ' +
                    ( is_node ? '../../../../../..' : '/../../../../../../..' ) +
                    mod_root.split( ft.getRootPath( ) )[ 1 ] +
                    '/node_modules/' +
                    key + d +
                    'lib/sources' );

                res = res.concat( getDepsWithPrefixRootArray( nextModule, is_node ) );
                modulesMap[key] = 0;

            }else{

                var seeUp = mod_root.lastIndexOf( 'node_modules' ) >= 0;

                if( seeUp ){

                    var rootUp = mod_root.substring( 0, mod_root.lastIndexOf('node_modules') + 12 );

                    while( seeUp ){

                        if( ft.isFileExist( rootUp + d + key + d + 'package.json' ) ){

                            seeUp = false;

                            res.push( '--root_with_prefix=' + rootUp + d +
                                key + d +
                                'lib' + d +
                                'sources ' +
                                ( is_node ? '../../../../../..' : '/../../../../../../..' ) +
                                rootUp.split( ft.getRootPath( ) )[ 1 ] +
                                '/node_modules/' +
                                key + d +
                                'lib/sources' );

                            res = res.concat( getDepsRootArray( rootUp + d + key ) );
                            modulesMap[key] = 0;

                            break;
                        }

                        rootUp = rootUp.substring( 0, rootUp.lastIndexOf( 'node_modules' ) );
                        seeUp = rootUp.lastIndexOf( 'node_modules' ) >= 0;
                        if( seeUp ){

                            rootUp = rootUp.substring( 0, rootUp.lastIndexOf( 'node_modules' ) + 12 );
                        }
                    }
                }

            }
        }
    }
    return res;
}

/**
 * Returns externs string settings for compiler command.
 * @returns {string}
 */
function getExternsString( ){

    var d = ft.CONST.PATH_DELIMITER;
    var files;
    var string = '';

    files = ft.getFilesRecursively(

        ft.getIdkPath( ) + d +
        'lib' + d +
        'externs' );

    files.forEach( function( file ){

        string = string + '--compiler_flags="--externs=' + file + '" ';
    } );
    return string;
}

/**
 * Returns externs array settings for compiler command.
 * @returns {Array}
 */
function getExternsArray( ){

    var d = ft.CONST.PATH_DELIMITER;
    var files;

    files = ft.getFilesRecursively(

        ft.getIdkPath( ) + d +
        'lib' + d +
        'externs' );

    return files.map( function( file ){

        return '--compiler_flags=--externs=' + file;
    } );
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
    var cmd;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );

    // Remove deps.js if exist.
    if( ft.isFileExist( ft.getRootPath( ) + d + 'deps.js' ) ){

        ft.removeFile( ft.getRootPath( ) + d + 'deps.js' );
    }

    var paramsAndOptions = [];

    paramsAndOptions.push( ft.getIdkPath( ) + d +
        ft.CONST.NODE_MODULE_FOLDER + d +
        'google-closure-library' + d +
        'closure' + d +
        'bin' + d +
        'build' + d +
        'depswriter.py' );

    // Dependency modules
    var depsArray = getDepsWithPrefixRootArray( ft.getRootPath( ) );
    var filteredByErrors = goog.object.filter( modulesMap, function( value, key, object ){

        return value !== 0;
    } );
    if( goog.object.getCount( filteredByErrors ) > 0 ){

        modulesMap = { };
        var errorStr = 'Unresolved dependencies: ' + goog.object.getValues( filteredByErrors ).join( ', ' );
        throw new Error( errorStr );
    }
    paramsAndOptions = paramsAndOptions.concat( depsArray );

    // Module dependencies
    paramsAndOptions.push( '--root_with_prefix=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES +
        ' /../../../../../../../lib/sources/' );

    paramsAndOptions.push( '--output_file=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES + d +
        'deps.js' );

    try{

        //Use spawn because may be too many params.
        // There's a limit of using parameters in command line in Windows OS
        var result = childProcessSync( 'python', paramsAndOptions );

        if( result.status !== 0 ){

            throw new Error( result.stderr );
        }

    }catch(e){

        console.log(e);
    }

    modulesMap = { };
    paramsAndOptions = [];

    // Remove deps.js if exist.
    if( ft.isFileExist( ft.getRootPath( ) + d + 'deps-node.js' ) ){

        ft.removeFile( ft.getRootPath( ) + d + 'deps-node.js' );
    }

    paramsAndOptions.push( ft.getIdkPath( ) + d +
        ft.CONST.NODE_MODULE_FOLDER + d +
        'google-closure-library' + d +
        'closure' + d +
        'bin' + d +
        'build' + d +
        'depswriter.py' );

    // Dependency modules
    depsArray = getDepsWithPrefixRootArray( ft.getRootPath( ), true );
    filteredByErrors = goog.object.filter( modulesMap, function( value, key, object ){

        return value !== 0;
    } );
    if( goog.object.getCount( filteredByErrors ) > 0 ){

        modulesMap = { };
        var errorStr = 'Unresolved dependencies: ' + goog.object.getValues( filteredByErrors ).join( ', ' );
        throw new Error( errorStr );
    }
    paramsAndOptions = paramsAndOptions.concat( depsArray );

    // Module dependencies
    paramsAndOptions.push( '--root_with_prefix=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES +
        ' ../../../../../../lib/sources/' );

    paramsAndOptions.push( '--output_file=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES + d +
        'deps-node.js' );

    try{

        //Use spawn because may be too many params.
        // There's a limit of using parameters in command line in Windows OS
        var result = childProcessSync( 'python', paramsAndOptions );

        if( result.status !== 0 ){

            throw new Error( result.stderr );
        }

    }catch(e){

        console.log(e);
    }

    modulesMap = { };
}


/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileJs( ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    //var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
    var srvCfg = cfg;

    notifier.notify( {

        'title': 'Scripts',
        'message': 'Compiling application'
    } );

    if( !ft.isDirExist( ft.getRootPath( ) + d + cfg.PATH.BIN ) ){

        ft.createDir( ft.getRootPath( ) + d + cfg.PATH.BIN );
    }
    if( ft.isFileExist( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js' ) ){

        ft.removeFile( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js' );
    }
    if( ft.isFileExist( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js.map' ) ){

        ft.removeFile( ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.NAMESPACE +'.js.map' )
    }

    var paramsAndOptions = [];

    paramsAndOptions.push( ft.getIdkPath( ) + d +
        ft.CONST.NODE_MODULE_FOLDER + d +
        'google-closure-library' + d +
        'closure' + d +
        'bin' + d +
        'build' + d +
        'closurebuilder.py' );

    // Google Closure Library root folder
    paramsAndOptions.push( '--root=' +
        ft.getIdkPath( ) + d +
        ft.CONST.NODE_MODULE_FOLDER + d +
        'google-closure-library' + d +
        'closure' + d +
        'goog' );

    // Google Closure Library Soy namespace
    paramsAndOptions.push( '--root=' +
        ft.getIdkPath( ) + d +
        'bin' + d +
        'templates' );

    // Google Closure Library Third Party root folder
    paramsAndOptions.push( '--root=' +
        ft.getIdkPath( ) + d +
        ft.CONST.NODE_MODULE_FOLDER + d +
        'google-closure-library' + d +
        'third_party' + d +
        'closure' + d +
        'goog' );

    // Externs
    paramsAndOptions = paramsAndOptions.concat( getExternsArray( ) );

    // Module root folder
    paramsAndOptions.push( '--root=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES );

    // Dependency modules
    var depsArray = getDepsRootArray( ft.getRootPath( ) );
    var filteredByErrors = goog.object.filter( modulesMap, function( value, key, object ){

        return value !== 0;
    } );
    if( goog.object.getCount( filteredByErrors ) > 0 ){

        var errorStr = 'Unresolved dependencies: ' + goog.object.getValues( filteredByErrors ).join( ', ' );
        throw new Error( errorStr );
    }
    paramsAndOptions = paramsAndOptions.concat( depsArray );

    // Project namespace
    paramsAndOptions.push( '--namespace=' + cfg.NAMESPACE );

    // Compilation mode
    paramsAndOptions.push( '--output_mode=compiled' );

    // Compiler jar file
    paramsAndOptions.push( '--compiler_jar=' +
        ft.getIdkPath( ) + d +
        'bin' + d +
        'compiler' + d +
        'compiler.jar' );

    // CSS names map
    paramsAndOptions.push( '--compiler_flags=--js=' +
        ft.getRootPath( ) + d +
        cfg.PATH.LIB + d +
        cfg.PATH.SOURCES + d +
        'cssmap.js' );

    // DEBUG flag disabling
    paramsAndOptions.push( '--compiler_flags=--define=goog.DEBUG=false' );

    // Redefine all GLOBALS specified in config
    goog.object.forEach( cfg.GLOBALS, function( val, key ){

        paramsAndOptions.push( '--compiler_flags=--define=' + key + '=' +

            ( !goog.isString( val ) ? val : '\'' + val + '\'' ) );
    } );

    // Source map versions
    paramsAndOptions.push( '--compiler_flags=--source_map_format=V3' );

    // Compilation level
    paramsAndOptions.push( '--compiler_flags=--compilation_level=' +
        srvCfg.COMPILATION.COMPILE_LEVEL );

    // Incoming language version
    paramsAndOptions.push( '--compiler_flags=--language_in=' +
        srvCfg.COMPILATION.INPUT_LANGUAGE );

    // Result language version
    paramsAndOptions.push( '--compiler_flags=--language_out=' +
        srvCfg.COMPILATION.OUTPUT_LANGUAGE );

    // Output source map file
    paramsAndOptions.push( '--compiler_flags=--create_source_map=' +
        ft.getRootPath( ) + d +
        cfg.PATH.BIN + d +
        cfg.NAMESPACE +'.js.map' );

    // Output app file
    paramsAndOptions.push( '--compiler_flags=--js_output_file=' +
        ft.getRootPath( ) + d +
        cfg.PATH.BIN + d +
        cfg.NAMESPACE +'.js' );

    try{

        //Use spawn because may be too many params.
        // There's a limit of using parameters in command line in Windows OS
        var result = childProcessSync( 'python', paramsAndOptions );

        if( result.status !== 0 ){

            throw new Error( result.stderr );
        }

        ft.copyFile( ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.js', ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.tst.js' );

        var file = ft.openFile(

            ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.tst.js' );

        file = file + '\n';
        file = file + '//@ sourceMappingURL=' + cfg.NAMESPACE + '.js.map';
        ft.saveFile(

            ft.getRootPath( ) + d +
            cfg.PATH.BIN + d +
            cfg.NAMESPACE +'.tst.js',

            file );

    }catch(e){

        console.log(e);
    }

    modulesMap = { };
}

/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileApplication( ){

    template.compileTemplates( );
    stylesheet.css( );
    calculateDependencies( );
    compileJs( );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    calculateDependencies: calculateDependencies,
    compileJs: compileJs,
    compileApplication: compileApplication
};

