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

var childProcessSync = require('child_process').spawnSync;

var modules = [ ];

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
 * Return root paths for compile app cmd.
 * @param {string} mod_root
 * @returns {string}
 */
function getDepsRoot( mod_root ){

    var d = ft.CONST.PATH_DELIMITER;
    var res = '';
    var json = ft.openJson( mod_root + d + 'package.json' );
    for( var key in json.dependencies ){

        if( !~modules.indexOf( key ) && !isSupportedNodePackage( key ) ){

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
 * Return root paths array for compile app cmd.
 * @param {string} mod_root
 * @returns {Array}
 */
function getDepsRootArray( mod_root ){

    var d = ft.CONST.PATH_DELIMITER;
    var res = [];
    var json = ft.openJson( mod_root + d + 'package.json' );
    for( var key in json.dependencies ){

        if( !~modules.indexOf( key ) && !isSupportedNodePackage( key ) ){

            modules.push( key );

            res.push( '--root=' + mod_root + d +
                'node_modules' + d +
                key + d +
                'lib' + d +
                'sources' );
            res = res.concat( getDepsRootArray( mod_root + d + 'node_modules' + d + key ) );
        }
    }
    return res;
}

/**
 * Return root paths for calc deps cmd.
 * @param {string} mod_root
 * @param {boolean=} is_node
 * @returns {string}
 */
function getDepsWithPrefixRoot( mod_root, is_node ){

    var d = ft.CONST.PATH_DELIMITER;
    var res = '';
    var json = ft.openJson( mod_root + d + 'package.json' );
    for( var key in json.dependencies ){

        if( !~modules.indexOf( key ) && !isSupportedNodePackage( key ) ){

            modules.push( key );
            res = res + '--root_with_prefix="';
            res = res +

                mod_root + d +
                'node_modules' + d +
                key + d +
                'lib' + d +
                'sources ' +

                ( is_node ? '../../../../../..' : '/../../../../../../..' ) +
                mod_root.split( ft.getRootPath( ) )[ 1 ] +
                '/node_modules/' +
                key + d +
                'lib/sources" ';
            res = res + getDepsWithPrefixRoot( mod_root + d + 'node_modules' + d + key, is_node );
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

        if( !~modules.indexOf( key ) && !isSupportedNodePackage( key ) ){

            modules.push( key );

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

            res = res.concat( getDepsWithPrefixRootArray( mod_root + d + 'node_modules' + d + key, is_node ) );
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
    paramsAndOptions = paramsAndOptions.concat( getDepsWithPrefixRootArray( ft.getRootPath( ) ) );

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
        childProcessSync( 'python', paramsAndOptions );

    }catch(e){

        console.log(e);
    }

    modules = [ ];
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
    paramsAndOptions = paramsAndOptions.concat( getDepsWithPrefixRootArray( ft.getRootPath( ), true ) );

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
        childProcessSync( 'python', paramsAndOptions );

    }catch(e){

        console.log(e);
    }

    modules = [ ];
}


/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileJs( ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
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
    paramsAndOptions = paramsAndOptions.concat( getDepsRootArray( ft.getRootPath( ) ) );

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
        childProcessSync( 'python', paramsAndOptions );

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

    modules = [ ];
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

