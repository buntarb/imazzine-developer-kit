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
 * @returns  {Array} linkArray
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

    return( linksArray );
}


/**
 * Remove files from documentation.
 * @param {Array} docArr
 */

function removeFiles( docArr ){

    for( var i = docArr.length - 1; i >= 0; i--  ){

        if( docArr[ i ][ 'kind' ] === "file" ||
            docArr[ i ][ 'longname' ] === "package:undefined" ||
            docArr[ i ][ 'undocumented' ] ||
            docArr[ i ][ 'longname' ].indexOf( "{" ) === 0 ){

            docArr.splice( i, 1 );
        }
    }
}

/**
 * Create additional nodes.
 * @param {Array} docArr
 * @returns {Object} map
 */

function addNodes( docArr ){

    var map = { };
    for( var i = 0; i < docArr.length; i++ ){

        map[ docArr[ i ][ 'longname' ] ] = i;
        docArr[ i ][ 'children' ] = [ ];
        if( docArr[ i ][ 'memberof' ] ){

            var parentExist = false;
            for( j = 0; j < docArr.length; j ++ ){

                if( !parentExist && docArr[ i ][ 'memberof' ] === docArr[ j ][ 'longname' ] ){

                    parentExist = true;
                }
            }
            if( !parentExist ){

                docArr.push( {

                    name: ~docArr[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        docArr[ i ][ 'memberof' ].slice( docArr[ i ][ 'memberof' ].lastIndexOf( "." ) + 1 ) :
                        docArr[ i ][ 'memberof' ],

                    longname: docArr[ i ][ 'memberof' ],
                    kind: "constant",
                    memberof: ~docArr[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        docArr[ i ][ 'memberof' ].slice( 0, docArr[ i ][ 'memberof' ].lastIndexOf( "." ) ) :
                        "",

                    children: [ ]
                } );
            }
        }
    }
    return map;
}

/**
 * Create tree from doc.
 * @param {Array} docArr
 * @param {Object} mapObj
 * @returns {Array} tree
 */

function createTree( docArr, mapObj ){

    var tree = [ ];
    try{

        for( var i = 0; i < docArr.length; i++ ){

            if( docArr[ i ][ 'memberof' ] && docArr[ i ][ 'memberof' ].length ){

                docArr[ mapObj[ docArr[ i ][ 'memberof' ] ] ].children.push( docArr[ i ] );

            }else{

                tree.push( docArr[ i ] );
            }
        }
    }catch( e ){

        console.log( e );
    }
    return tree;
}

/**
 * Create layer array from tree.
 * @param {Array} treeArr
 * @returns {Array} queue
 */

function createLayerArray( treeArr ){

    var i, j;
    var level = 0;
    var queue = [ treeArr ];

    while( queue[ level ] && queue[ level ].length ){

        for( i = 0; i < queue[ level ].length; i++ ){

            if( queue[ level ][ i ] && queue[ level ][ i ].children ) {

                for( j = 0; j <= queue[ level ][ i ].children.length - 1; j++ ){

                    queue[ level + 1 ] = queue[ level + 1 ] || [ ];
                    queue[ level + 1 ].push( queue[ level ][ i ].children[ j ] );
                }
                if( queue[ level ][ i ][ 'meta' ] ){

                    queue[ level ][ i ][ 'filename' ] = queue[ level ][ i ][ 'meta' ][ 'filename' ];
                    queue[ level ][ i ][ 'lineno' ] = queue[ level ][ i ][ 'meta' ][ 'lineno' ];
                    queue[ level ][ i ][ 'path' ] = queue[ level ][ i ][ 'meta' ][ 'path' ];
                    delete queue[ level ][ i ][ 'meta' ];
                }
                delete queue[ level ][ i ].children;
                delete queue[ level ][ i ].comment;

                if( queue[ level ][ i ][ 'params' ] ){

                    for( j = 0; j < queue[ level ][ i ][ 'params' ].length; j++ ){

                        if( queue[ level ][ i ][ 'params' ][ j ][ 'type' ] ){

                            queue[ level ][ i ][ 'params' ][ j ][ 'types' ] =

                                queue[ level ][ i ][ 'params' ][ j ][ 'type' ][ 'names' ];

                            delete queue[ level ][ i ][ 'params' ][ j ][ 'type' ];
                        }
                    }
                }

            }
        }
        level++;
    }
    return queue;
}


/**
 * Save files.
 * @param {Array} docArr
 * @param {Object} mapObj
 * @param {Array} treeArr
 * @param {Array} queueArr
 */

function saveFiles( docArr, mapObj, treeArr, queueArr ){

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'doc.json',

        docArr );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'map.json',

        mapObj );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'tree.json',

        treeArr );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'queue.json',

        queueArr );
}
/**
 * Compile documentation.
 */
function compileDocument( ) {

    var map = {};
    var tree = [ ];
    var queue = [ ];
    var linksArray = getDeps( );
    var doc = jsdoc.explainSync( {files: linksArray} );

    removeFiles( doc );
    map = addNodes( doc );
    tree = createTree( doc, map );
    queue = createLayerArray( tree );
    saveFiles( doc, map, tree, queue );

    //// remove files & undocumented
    //for( i = doc.length - 1; i >= 0; i--  ){
    //
    //    if( doc[ i ][ 'kind' ] === "file" ||
    //        doc[ i ][ 'longname' ] === "package:undefined" ||
    //        doc[ i ][ 'undocumented' ] ){
    //
    //        doc.splice( i, 1 );
    //    }
    //}

    //create nodes
    //for( i = 0; i < doc.length; i++ ){
    //
    //    map[ doc[ i ][ 'longname' ] ] = i;
    //    doc[ i ][ 'children' ] = [ ];
    //    if( doc[ i ][ 'memberof' ] ){
    //
    //        var parentExist = false;
    //        for( j = 0; j < doc.length; j ++ ){
    //
    //            if( !parentExist && doc[ i ][ 'memberof' ] === doc[ j ][ 'longname' ] ){
    //
    //                parentExist = true;
    //            }
    //        }
    //        if( !parentExist ){
    //
    //            doc.push( {
    //
    //                name: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?
    //
    //                    doc[ i ][ 'memberof' ].slice( doc[ i ][ 'memberof' ].lastIndexOf( "." ) + 1 ) :
    //                    doc[ i ][ 'memberof' ],
    //
    //                longname: doc[ i ][ 'memberof' ],
    //                kind: "constant",
    //                memberof: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?
    //
    //                    doc[ i ][ 'memberof' ].slice( 0, doc[ i ][ 'memberof' ].lastIndexOf( "." ) ) :
    //                    "",
    //
    //                children: [ ]
    //            } );
    //        }
    //    }
    //}

    //create tree
    //try {
    //
    //    for( i = 0; i < doc.length; i++ ){
    //
    //        if( doc[ i ][ 'memberof' ] && doc[ i ][ 'memberof' ].length ){
    //
    //            doc[ map[ doc[ i ][ 'memberof' ] ] ].children.push( doc[ i ] );
    //
    //        }else{
    //
    //            tree.push( doc[ i ] );
    //        }
    //    }
    //}catch( e ){
    //
    //    console.log( e );
    //}

    //create layer array
    //var level = 0;
    //var queue = [ tree ];
    //
    //while( queue[ level ] && queue[ level ].length ){
    //
    //    for( i = 0; i < queue[ level ].length; i++ ){
    //
    //        if( queue[ level ][ i ] && queue[ level ][ i ].children ) {
    //
    //            //queue[ level ][ i ].children.forEach( function( item ){
    //            //
    //            //    queue[ level + 1 ] = queue[ level + 1 ] || [ ];
    //            //    queue[ level + 1 ].push( item );
    //            //} );
    //
    //            for( j = 0; j <= queue[ level ][ i ].children.length; j++ ){
    //
    //                queue[ level + 1 ] = queue[ level + 1 ] || [ ];
    //                queue[ level + 1 ].push( queue[ level ][ i ].children[ j ] );
    //            }
    //        }
    //    }
    //    level++;
    //};

    //save files
    //ft.saveJson(
    //
    //    ft.getRootPath( ) + d +
    //    'lib' + d +
    //    'sources' + d +
    //    'doc.json',
    //
    //    doc );
    //
    //ft.saveJson(
    //
    //    ft.getRootPath( ) + d +
    //    'lib' + d +
    //    'sources' + d +
    //    'map.json',
    //
    //    map );
    //
    //ft.saveJson(
    //
    //    ft.getRootPath( ) + d +
    //    'lib' + d +
    //    'sources' + d +
    //    'tree.json',
    //
    //    tree );
    //
    //ft.saveJson(
    //
    //    ft.getRootPath( ) + d +
    //    'lib' + d +
    //    'sources' + d +
    //    'queue.json',
    //
    //    queue[0] );
}

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

    compileDocument: compileDocument
};
