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
 * @fileoverview IDK installation file.
 */

require( 'google-closure-library' );
goog.require('goog.structs.Map');
goog.require( 'goog.object' );

/**********************************************************************************************************************
 * Globals                                                                                                          *
 **********************************************************************************************************************/

var readline = require('readline');

/**
 * Filetools service.
 */
var ft = require( './lib/filetools.js' );

/**
 * Yaml parser.
 */
var yaml = require( 'yamljs' );

// var fileFrom, fileTo;

/**
 * Read line interface.
 * @type {*}
 */
var rl = readline.createInterface( {

    input: process.stdin,
    output: process.stdout
} );

/**
 * Object for request parameters from user.
 * It is used in the folowing functions:
 * createPackageJson(),
 * createPackageJsonAndStructure()
 */
var requestObj;

/**
 * Matches to a installconfig.yaml file.
 * It is used in the folowing functions:
 * getInstallConfigObj(),
 * createStructure()
 */
var installConfig = undefined;

/**
 * It is used in main procedure.
 * @type {string}
 */
var error = '';

/**
 * Map for replace substitutes in templates with real values from configuration files.
 * It is used in the folowing functions:
 * createPackageJson(),
 * getInstallConfigObj(),
 * createStructure(),
 * Main procedure
 * @type {goog.structs.Map}
 */
var regExpsMap = new goog.structs.Map();

/**
 * It is used in main procedure.
 * @type {string}
 */
var modName = '';

/**********************************************************************************************************************
 * Functions                                                                                                          *
 **********************************************************************************************************************/

/**
 * Formatting print to log console
 * @param {string} message
 */
function toLog( message ) {

    console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' + message );
}

/**
 * Transforming passed pseudo path into a real absolute path independently of OS.
 * @param {string} path is pseudo or absolute path.
 * 		moduleRoot in path param matches to a path for a module root.
 * 		idkRoot in path param matches to a path for a idk root.
 * 		Symbol / in path param matches to a path delimeter for current OS.
 * @return {string}
 */
function normalizePath( path ) {

    return path.replace( /\//g, ft.CONST.PATH_DELIMITER )
        .replace( /moduleRoot/g, ft.getRootPath() )
        .replace( /idkRoot/g, ft.getIdkPath() );
}

/**
 * Create directory
 * @param {string} path must be an absolute path to a directory.
 * @param {?boolean|undefined} disableLog is flag whether print message to log or not. Defaul is false.
 * @return {string} if is empty than there were no errors.
 */
function createDir( path, disableLog ) {

    var error = '';
    disableLog = disableLog || false;

    try {

        if( !disableLog ){

            toLog( '[' + path + '] creating...' );
        }

        ft.createDir( path );

        if( !ft.isDirExist( path ) ){

            error =  'Error while creating ' + path;
        }

    }catch ( e ){

        error =  '' + e;
    }

    return error;
}

/**
 * Save file
 * @param {string} path must be an absolute path to a file.
 * @param {string} data is a content of the file.
 * @param {?boolean|undefined} disableLog is flag whether print message to log or not. Defaul is false.
 * @return {string} if is empty than there were no errors.
 */
function saveFile( path, data, disableLog ) {

    var error = '';
    disableLog = disableLog || false;

    try {

        if( !disableLog ){

            toLog( '[' + path + '] creating...' );
        }

        ft.saveFile( path, data );
        if( !ft.isFileExist( path ) ){

            error =  'Error while creating ' + path;
        }

    }catch ( e ){

        error =  '' + e;
    }

    return error;
}

/**
 * Copy file
 * @param {string} source must be an absolute path to a file which should be copied.
 * @param {string} target must be an absolute path to a file where should be copied a source file.
 * @param {?boolean|undefined} disableLog is flag whether print message to log or not. Defaul is false.
 * @return {string} if is empty than there were no errors.
 */
function copyFile( source, target, disableLog ) {

    var error = '';
    disableLog = disableLog || false;

    try {

        if( !disableLog ){

            toLog( '[' + target + '] copying...' );
        }

        if( !ft.copyFile( source, target ) ){

            error = "Can't copy " + source + " to " + target;
        }

    }catch ( e ){

        error =  '' + e;
    }

    return error;
}

/**
 * Replace substitutions in the passed text with the values form passed hash map.
 * Substitutions in the text must be written in form [{(somesubstitution)}].
 * @param {string} content is text to replace.
 * @param {goog.structs.Map} transformMap is Hash Map where key maches to substitution name
 * 		and value is an Object as {re: RegExp, value: replacingText}
 * @return {string} if is empty than there were no errors.
 */
function transformText( content, transformMap ) {

    var text = content;

    var valReArray = transformMap.getValues();
    for( var i = 0; i < valReArray.length; i++ ){

        text = text.replace( valReArray[ i ].re, valReArray[ i ].value + '' );
    }

    return text;
}

/**
 * Copy file with replacing substitutions in source file by using transformText() function.
 * @param {string} source must be an absolute path to a file which should be copied.
 * @param {string} target must be an absolute path to a file where should be copied a source file.
 * @param {goog.structs.Map} transformMap is Hash Map where key maches to substitution name
 * 		and value is an Object as {re: RegExp, value: replacingText}
 * @param {?boolean|undefined} disableLog is flag whether print message to log or not. Defaul is false.
 * @return {string} if is empty than there were no errors.
 */
function copyFileWithTransform( source, target, transformMap, disableLog ) {

    var error = '';
    disableLog = disableLog || false;

    try {

        if( !disableLog ){

            toLog( '[' + target + '] transforming and copying...' );
        }

        var content = ft.openFile( source );
        content = transformText( content, transformMap  );

        var disableLog = true;
        error = saveFile( target, content, disableLog );

    }catch ( e ){

        error =  '' + e;
    }

    return error;
}

/**
 * Helper function. It makes formatting string for error message.
 * @param {Object} obj must be in form { paramName: paramValue, ...}.
 * @return {string} if is empty than there were no errors.
 * @private
 */
function _buildErrorForMissedParams( obj ) {

    var error = '';

    for( var param in obj ){

        if( !obj[ param ] ){

            if( '' === error ){

                error = 'Must be defined ' + param;
            }else{

                error += ' and ' + param;
            }
        }
    }

    return error;
}

/**
 * Copy file with replacing substitutions in source file and overwrite target file if it already exists.
 * @param {string} source could be a pseudo or an absolute path to a file which should be copied.
 * @param {string} target could be a pseudo or an absolute path to a file where should be copied a source file.
 * @param {?goog.structs.Map|undefined} transformMap is Hash Map where key maches to substitution name
 * 		and value is an Object as {re: RegExp, value: replacingText}.
 * 		If it is missed the file will be copied without transformation.
 * @return {string} if is empty than there were no errors.
 */
function copyFileOverwrite( source, target, transformMap ) {

    var error = '';

    if( target && source ){

        var pathTarget = normalizePath( target );
        var pathSource = normalizePath( source );

        if( transformMap ){

            error = copyFileWithTransform( pathSource, pathTarget, transformMap );

        }else{

            error = copyFile( pathSource, pathTarget );
        }
    }else{

        error = _buildErrorForMissedParams( { 'TARGET': target, 'SOURCE': source } );
    }

    return error;
}

/**
 * Copy file only when target file doesn't exist with replacing substitutions in source file.
 * @param {string} source could be a pseudo or an absolute path to a file which should be copied.
 * @param {string} target could be a pseudo or an absolute path to a file where should be copied a source file.
 * @param {?goog.structs.Map|undefined} transformMap is Hash Map where key maches to substitution name
 * 		and value is an Object as {re: RegExp, value: replacingText}.
 * 		If it is missed the file will be copied without transformation.
 * @return {string} if is empty than there were no errors.
 */
function copyFileIfNotExist( source, target, transformMap ) {

    var error = '';

    if( target && source ){

        var pathTarget = normalizePath( target );

        if( !ft.isFileExist( pathTarget ) ){

            var pathSource = normalizePath( source );

            if( transformMap ){

                error = copyFileWithTransform( pathSource, pathTarget, transformMap );

            }else{

                error = copyFile( pathSource, pathTarget );
            }
        }

    }else{

        error = _buildErrorForMissedParams( { 'TARGET': target, 'SOURCE': source } );
    }

    return error;
}

/**
 * Create file or directory depending on the passed parameter type only if it doesn't exist.
 * @param {string} target could be a pseudo or an absolute path.
 * @param {string} type if dir - create a directory, if file - create a file, otherwise - return error message.
 * @param {?string|undefined} data is a file content in case when type equals file. Default is empty string.
 * @return {string} if is empty than there were no errors.
 */
function createIfNotExist( target, type, data) {

    var error = '';
    data = data || '';

    if( target && type ){

        type = type.toLowerCase();
        var isFile = false;
        var path;

        if( 'dir' === type ){

            isFile = false;

        }else if( 'file' === type ){

            isFile = true;

        }else{

            return 'Unsupported TYPE=' + type;
        }

        path = normalizePath( target );

        if( isFile  ){
            if( !ft.isFileExist( path ) ){

                error = saveFile( path, data );
            }
        }else if( !ft.isDirExist( path ) ){

            error = createDir( path );
        }

    }else{

        error = _buildErrorForMissedParams( { 'TARGET': target, 'TYPE': type } );
    }

    return error;
}

/**
 * Create file or directory depending on the passed parameter type with overwriting if it is a file and it already exists.
 * @param {string} target could be a pseudo or an absolute path.
 * @param {string} type if dir - create a directory, if file - create a file, otherwise - return error message.
 * @param {?string|undefined} data is a file content in case when type equals file. Default is empty string.
 * @return {string} if is empty than there were no errors.
 */
function createOverwrite( target, type, data) {

    var error = '';
    data = data || '';

    if( target && type ){

        type = type.toLowerCase();
        var isFile = false;
        var path;

        if( 'dir' === type ){

            isFile = false;

        }else if( 'file' === type ){

            isFile = true;

        }else{

            return 'Unsupported TYPE=' + type;
        }

        path = normalizePath( target );

        if( isFile  ){
            if( ft.isFileExist( path ) ){

                try{

                    ft.removeFile( path );

                    if( !ft.isFileExist( path ) ){

                        error = saveFile( path, data );
                    }else{

                        throw new Error( 'Existing file ' + path + ' cannot be removed' );
                    }
                }catch ( e ){

                    error =  'Error while creating ' + path;
                }
            }else{

                error = saveFile( path, data );
            }
        }else if( !ft.isDirExist( path ) ){

            error = createDir( path );
        }

    }else{

        error = _buildErrorForMissedParams( { 'TARGET': target, 'TYPE': type } );
    }

    return error;
}

/**
 * Select and launch an action such copy or create for directory or file depending on parameters.
 * @param {?string|undefined} source could be a pseudo or an absolute path to a file which should be copied.
 * 		If it is missed there will be a create action instead of a copy action.
 * @param {string} target could be a pseudo or an absolute path to a target file or directory.
 * @param {?boolean|undefined} isOverwrite is flag to overwrite target file.
 * 		In case a directory this parameter means nothing.
 * @param {string} type if dir - create a directory, if file - create a file.
 * 		This parameter implies a create action - when source parameter is missed.
 * @param {?goog.structs.Map|undefined} transformMap is Hash Map where key maches to substitution name
 * 		and value is an Object as {re: RegExp, value: replacingText}.
 * 		If it is missed the file will be copied without transformation.
 * 		This parameter implies a copy action - when source parameter exists.
 * @return {string} if is empty than there were no errors.
 */
function action( source, target, isOverwrite, type, transformMap ) {

    var error = '';

    if( source ){

        if( isOverwrite ){

            error = copyFileOverwrite( source, target, transformMap );
        }else{

            error = copyFileIfNotExist( source, target, transformMap );
        }
    }else{

        if( isOverwrite ){

            error = createOverwrite( target, type );
        }else{

            error = createIfNotExist( target, type );
        }
    }

    return error;
}

/**
 * Input values from command line recursively for object's properties defined in propsArray parameter.
 * @param {Object} obj according to a PACKAGEJSON part in installconfig.yaml file.
 * 		Value for each property will be stored in its property called value.
 * @param {string} prop is a current property name for request from user.
 * @param {Array.<string>} propsArray is a list of properies for request from user.
 * @param {number} currentIndex is a current index in array of the propsArray parameter.
 * 		Initially it usually equals 0 and then it will increase while next recursive iteration occur.
 * @param {?Array.<Function>|undefined} chainFunctionsArray is an array of functions
 * 		to launch them at the end of all recursion.
 */
function question( obj, prop, propsArray, currentIndex, chainFunctionsArray ) {

    rl.question( 'Please enter ' + obj[prop].desc + ' [' + obj[prop].default + ']: ', function( input ){

        obj[prop].value = input || obj[prop].default;

        if( propsArray.length > ( currentIndex + 1 ) ){

            question( obj, propsArray[ currentIndex + 1 ], propsArray, ( currentIndex + 1 ), chainFunctionsArray );
        }else{

            if( chainFunctionsArray ){

                for( var i = 0; i < chainFunctionsArray.length; i++ ){

                    chainFunctionsArray[ i ]();
                }
            }
        }
    });
}

/**
 * Release resources.
 * @private
 */
function _cleanUp() {

    rl.close( );
    toLog( 'Done' );
}

/**
 * Initial creating modul's package.json file.
 * It takes values from global variable requestObj that must already have been filled at the moment.
 * Use question() function for it.
 */
function createPackageJson() {

    var moduleConfig = yaml.load( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );
    regExpsMap = ft.getSubstitutionsMap( moduleConfig, '', new goog.structs.Map() );

    for( var template in requestObj ){

        regExpsMap.set( template,
            { re: new RegExp( '\\[\\{\\(' + template + '\\)\\}\\]', 'g' ),
                value: requestObj[ template ].value } );
    }

    error = copyFileIfNotExist( 'idkRoot/tpl/package.tpl', 'moduleRoot/package.json', regExpsMap );

    if( '' !== error ){

        toLog( 'Error while creating package.json: ' + error );
    }
}

/**
 * Get object that matches to a installconfig.yaml file
 * with replaced substitution variables from config.yaml and package.json files if latest is existed.
 */
function getInstallConfigObj() {

    if( !installConfig ) {

        var moduleConfig = yaml.load( ft.getRootPath() + ft.CONST.PATH_DELIMITER + 'config.yaml' );
        regExpsMap = ft.getSubstitutionsMap( moduleConfig, '', new goog.structs.Map() );

        if ( ft.isFileExist( ft.getRootPath() + ft.CONST.PATH_DELIMITER + 'package.json' )) {

            var packageJson = ft.openJson( ft.getRootPath() + ft.CONST.PATH_DELIMITER + 'package.json' );
            regExpsMap.addAll( ft.getSubstitutionsMap( packageJson, '', new goog.structs.Map() ) );
        }


        var installConfigStr = ft.openFile( ft.getIdkPath() + ft.CONST.PATH_DELIMITER + 'installconfig.yaml' );
        installConfigStr = transformText( installConfigStr, regExpsMap );

        installConfig = yaml.parse( installConfigStr );
    }

    return installConfig;
}

/**
 * Create module's package.json with request needed parameters and then module's stucture.
 */
function createPackageJsonAndStructure() {

    var now = new Date( );
    var modVersion = '' +
        now.getFullYear( ) +
        ( ( now.getMonth( ) + 1 ) < 10 ? '0' + ( now.getMonth( ) + 1 ) : ( now.getMonth( ) + 1 ) ) +
        now.getDate( ) + '.0.0';

    requestObj = getInstallConfigObj().PACKAGEJSON;
    requestObj.VERSION.default = modVersion;

    var propsArray = goog.object.getKeys( requestObj );
    question( requestObj, propsArray[ 0 ], propsArray, 0, [ createPackageJson, createStructure ] );
}

/**
 * Create module's stucture according to a installconfif.yaml file.
 * Do other administrative actions.
 * You must use this as a final function.
 */
function createStructure() {

    if( ft.isFileExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'package.json' ) ){

        installConfig = undefined; // clear cache for this variable
        var structure = getInstallConfigObj().STRUCTURE;

        for( var subj in structure ){

            error = action( structure[subj].SOURCE, structure[subj].TARGET,
                structure[subj].OVERWRITE, structure[subj].TYPE,
                structure[subj].APPLYTEMPLATE ? regExpsMap: undefined );

            if( '' !== error ){
                toLog( 'Error while creating structure by installconfig.yaml for ' + subj + ': ' + error );
            }
        }
    }else{

        toLog( 'Error: structure cannot be built completely because of ' +
            ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'package.json file is missed');
    }

    // Copy command files.
    error = copyFileOverwrite( 'idkRoot/tpl/cmd/idk', 'moduleRoot/idk' );
    if( '' === error ){

        if( !ft.CONST.IS_WINDOWS_OS ){
            try{

                toLog( '[' + ft.getRootPath( ) + '/idk] change permissions...' );

                ft.setFilePermission(

                    ft.getRootPath( ) +
                    ft.CONST.PATH_DELIMITER +
                    'idk',
                    ( 0400 | 0200 | 0100 | 0040 | 0020 | 0004 ) );
            }catch ( e ){

                toLog( 'Error while change permissions idk file: ' + e );
            }
        }
    }else{

        toLog( 'Error while copying idk file: ' + error );
    }

    //Create idk alias in Unix
    if( !ft.CONST.IS_WINDOWS_OS ){
        try{

            var res = ft.execute( 'cat ~/.bashrc');
            if( res && !/alias\s*idk\s*=\s*['"]\.\/idk['"]/.test( res.toString() ) ){

                var aliasIdk = 'echo "alias idk=\'./idk\'" >> ~/.bashrc';
                res = ft.execute( aliasIdk );
                res = ft.execute( '. ~/.bashrc' );  //doesn't work for current session
            }

        }catch( e ){

            toLog( 'Error while creating idk alias: ' + e );
        }
    }

    _cleanUp();
    process.exit( 0 );
}

/**********************************************************************************************************************
 * Main procedure                                                                                                     *
 **********************************************************************************************************************/

toLog( 'installation start...' );

if( !ft.isFileExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' ) ){

    var tmpModuleName = ft.getRootPath( ).split( ft.CONST.PATH_DELIMITER );
    tmpModuleName = tmpModuleName[ tmpModuleName.length - 1 ]
        .replace( /\W+/g, '_' )
        .toLowerCase( );

    rl.question( 'Please enter module name [' + tmpModuleName + ']: ', function( input ){

        modName = input || tmpModuleName;

        regExpsMap.set( 'NAMESPACE', { re: /\[\{\(NAMESPACE\)\}\]/g, value: modName } );
        error = copyFileIfNotExist( 'idkRoot/tpl/module.yaml', 'moduleRoot/config.yaml', regExpsMap );

        if( '' === error){

            if( !ft.isFileExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'package.json' ) ){

                createPackageJsonAndStructure();
            }else{

                createStructure();
            }
        }else{

            toLog( 'Error while creating config.yaml: ' + error );
            _cleanUp();
        }
    });

}else {

    if( !ft.isFileExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'package.json' ) ){

        createPackageJsonAndStructure();
    }else{

        createStructure();
    }
}