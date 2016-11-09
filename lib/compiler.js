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
 * @fileoverview Declare compiler commands.
 */

var notifier = require( 'node-notifier' );
var yaml = require( 'yamljs' );
var ft = require( './filetools.js' );
var template = require( './template.js' );
var stylesheet = require( './stylesheet.js' );

require( 'google-closure-library' );
goog.require( 'goog.object' );
goog.require('goog.structs.Map');

var childProcessSync = require('child_process').spawnSync;

var modulesMap = { };

/**
 * Return true if {@code name} is supported by IDK node module.
 * @param {string} name
 * @return {boolean}
 */
function isSupportedNodePackage( name ){

    return name === 'imazzine-developer-kit' ||

        name === 'ws';
}

/**
 * Return root paths array for compile app cmd.
 * @param {string} mod_root
 * @return {Array}
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

                modulesMap[key] = 0;
                res = res.concat( getDepsRootArray( nextModule ) );
                // modulesMap[key] = 0;

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

                            modulesMap[key] = 0;
                            res = res.concat( getDepsRootArray( rootUp + d + key ) );
                            // modulesMap[key] = 0;

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
 * @return {Array}
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

                modulesMap[key] = 0;
                res = res.concat( getDepsWithPrefixRootArray( nextModule, is_node ) );
                // modulesMap[key] = 0;

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
                                '/' +
                                key + d +
                                'lib/sources' );

                            modulesMap[key] = 0;
                            res = res.concat( getDepsWithPrefixRootArray( rootUp + d + key, is_node ) );
                            // modulesMap[key] = 0;

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
 * @return {string}
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
 * @return {Array}
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
 * compileJs with parameters.
 * @param {string} namespace
 * @param {string} outPath
 * @private
 */
function _compileJs( namespace, outPath ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    //var srvCfg = yaml.load( ft.getIdkPath( ) + d + 'config.yaml' );
    var srvCfg = cfg;

    notifier.notify( {

        'title': 'Scripts',
        'message': 'Compiling namespace'
    } );

    if( !ft.isDirExist( outPath ) ){

        ft.createDirectoriesRecursively( outPath );
    }
    if( ft.isFileExist( outPath + d + namespace +'.js' ) ){

        ft.removeFile( outPath + d + namespace +'.js' );
    }
    if( ft.isFileExist( outPath + d + namespace +'.js.map' ) ){

        ft.removeFile( outPath + d + namespace +'.js.map' )
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
    paramsAndOptions.push( '--namespace=' + namespace );

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
        outPath + d +
        namespace +'.js.map' );

    // Output app file
    paramsAndOptions.push( '--compiler_flags=--js_output_file=' +
        outPath + d +
        namespace +'.js' );

    try{

        //Use spawn because may be too many params.
        // There's a limit of using parameters in command line in Windows OS
        var result = childProcessSync( 'python', paramsAndOptions );

        if( result.status !== 0 ){

            throw new Error( result.stderr );
        }

        ft.copyFile( outPath + d +
            namespace +'.js', outPath + d +
            namespace +'.tst.js' );

        var file = ft.openFile(

            outPath + d +
            namespace +'.tst.js' );

        file = file + '\n';
        file = file + '//@ sourceMappingURL=' + namespace + '.js.map';
        ft.saveFile(

            outPath + d +
            namespace +'.tst.js',

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
function compileJs( ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    _compileJs( cfg.NAMESPACE, ft.getRootPath( ) + d + cfg.PATH.BIN );
}

/**
 * Compile service.
 * @param {string} namespace
 */
function compileSvc( namespace ){

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    _compileJs( namespace, ft.getRootPath( ) + d + cfg.PATH.BIN + d + cfg.PATH.SVC );
}

/**
 * Compile models.
 */
function compileModels( ){

    notifier.notify( {

        'title': 'Models',
        'message': 'Compile Models'
    } );

    var d = ft.CONST.PATH_DELIMITER;
    var cfg = yaml.load( ft.getRootPath( ) + d + 'config.yaml' );
    var requireLoopRegExp = new RegExp(  '\\[\\{\\(REQUIRELOOP\\)\\}\\]' , 'g' );
    var fieldsDefineRegExp = new RegExp(  '\\[\\{\\(FIELDSDEFINE\\)\\}\\]' , 'g' );

    if( !ft.isDirExist( ft.getRootPath() + d + cfg.PATH.LIB + d + 'models' ) ){

        ft.createDir( ft.getRootPath() + d + cfg.PATH.LIB + d + 'models' );
    }

    if( ft.isDirExist( ft.getRootPath() + d + cfg.PATH.LIB + d + 'models' ) ){

        var files = ft.getFiles( ft.getRootPath() + d + cfg.PATH.LIB + d + 'models' );
        var modelTpl = ft.openFile( ft.getIdkPath() + d + 'tpl' + d + 'model.tpl' );

        files.forEach( function( fileYaml ){

            var modelJs = modelTpl;
            var modelYaml = yaml.load( fileYaml );

            var regExpsMap = ft.getSubstitutionsMap( modelYaml, '', new goog.structs.Map() );
            var valReArray = regExpsMap.getValues();

            for( var i = 0; i < valReArray.length; i++ ){

                modelJs = modelJs.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
            }

            var strBufer;

            if( requireLoopRegExp.test( modelJs ) ){

                if( modelYaml.REQUIRE ){

                    strBufer = '';
                    var requires = modelYaml.REQUIRE;
                    for( var i = 0; i < requires.length; i++ ){

                        strBufer += 'goog.require( \'' + requires[i] + '\' );\n';
                    }

                    modelJs = modelJs.replace( requireLoopRegExp, strBufer );

                }else{

                    modelJs = modelJs.replace( requireLoopRegExp, '' );
                }
            }

            if( fieldsDefineRegExp.test( modelJs ) ){

                if( modelYaml.FIELDS ){

                    strBufer = '';
                    for( var field in modelYaml.FIELDS ){

                        var type = modelYaml.FIELDS[field].type;
                        var lastPointIndex = type.lastIndexOf( '.' );
                        if( lastPointIndex > 0 ){

                            type = type.substring( lastPointIndex + 1 );
                        }

                        if( type === 'STRING' ){ type = 'string'; }
                        else if( type === 'NUMBER' ){ type = 'number'; }
                        else if( type === 'BOOLEAN' ){ type = 'boolean'; }
                        else { type = modelYaml.FIELDS[field].type; }

                        strBufer += '    /**\n     * @type {' + type + '}\n     */\n';
                        strBufer += '    this.' + field + ' = undefined;\n\n';
                    }

                    modelJs = modelJs.replace( fieldsDefineRegExp, strBufer );

                }else{

                    modelJs = modelJs.replace( fieldsDefineRegExp, '' );
                }
            }

            var fileJs = ft.getRootPath() + d + cfg.PATH.LIB + d +
                cfg.PATH.SOURCES + d + 'models' +
                d + ft.getFileNameNoExt( fileYaml) + '.js';

            if( ft.isFileExist( fileJs ) ){

                ft.removeFile( fileJs );
            }

            ft.saveFile( fileJs, modelJs );

        } );
    }
}

/**
 * Compile existing application.
 * //@ sourceMappingURL=zz.js.map
 */
function compileApplication( ){

    compileModels( );
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
    compileApplication: compileApplication,
    compileSvc: compileSvc,
    compileModels: compileModels
};
