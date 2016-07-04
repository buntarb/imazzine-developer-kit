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
 * @author popkov.aleksander@gmail.com (Popkov Alexander)
 */

var ft = require( './filetools.js' );
var jsdoc = require('jsdoc-api');

var d = ft.CONST.PATH_DELIMITER;

/**
 * Get deps file.
 */
function getDeps( ){

    var linksArray = [ ];
    var deps = ft.openFile(

        ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'deps.js' );

    var pos = deps.indexOf( "goog.addDependency" );
    deps = deps.slice( pos );
    deps = deps.replace( /goog.addDependency\(/g, "[" );
    deps = deps.replace( /\);/g, "], " );
    deps = deps.replace( /'/g, "\"" );
    deps = '[' + deps;
    deps = deps.slice( 0, -4 );
    deps = deps + ']]';
    deps = JSON.parse( deps );
    deps.forEach( function( item ){

       item[ 0 ] = item[ 0 ].replace( /\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g, "./" );
       linksArray.push( item[ 0 ] );
    } );

    //ft.saveJson(
    //
    //    ft.getRootPath( ) + d +
    //    'lib' + d +
    //    'sources' + d +
    //    'deps.json',
    //
    //    linksArray );
    return( linksArray );
}

/**
 * Compile documentation.
 */
function compileDocument( ){

	var linkArray = getDeps( );

    var doc = jsdoc.explainSync( { files: linkArray } );
    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'doc.json',

        doc );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	compileDocument: compileDocument
};