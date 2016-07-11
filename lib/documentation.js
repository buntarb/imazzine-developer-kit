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
 * @fileoverview Declare documentation export command.
 * @author popkov.aleksander@gmail.com (Popkov Alexander)
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var jsdoc = require('jsdoc-api');
var comp = require( './compiler.js' );
var ft = require( './filetools.js' );
var d = ft.CONST.PATH_DELIMITER;

/**
 * Return array of JS files using by current module.
 * @returns  {Array}
 */
function getDeps( ){

    var linksArray = [ ];
    var deps = ft.openFile(

        ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'deps.js' );

    deps = deps.slice( deps.indexOf( "goog.addDependency" ) );
    deps = deps.replace( /goog.addDependency\(/g, "[" );
    deps = deps.replace( /\);/g, "], " );
    deps = deps.replace( /'/g, "\"" );
    deps = '[' + deps;
    deps = deps.slice( 0, -4 );
    deps = deps + ']]';
    deps = JSON.parse( deps );
    deps.forEach( function( item ){

        // TODO (blinker): this should be moved to some const.
        item[ 0 ] = item[ 0 ].replace( /\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g, "./" );
        linksArray.push( item[ 0 ] );
    } );
    return linksArray;
}

/**
 * Remove unnecessary properties from documentation array.
 * @param {Array} doc
 */
function removeUnnecessary( doc ){

    for( var i = doc.length - 1; i >= 0; i--  ){

        if( doc[ i ][ 'kind' ] === "file" ||
            doc[ i ][ 'longname' ] === "package:undefined" ||
            doc[ i ][ 'undocumented' ] ||
            doc[ i ][ 'longname' ].indexOf( "{" ) === 0 ){

            doc.splice( i, 1 );
        }
    }
}

/**
 * Add missing nodes to documentation tree, returns trees elements hash-map.
 * @param {Array} doc
 * @returns {Object}
 */
function addMissingNodes( doc ){

    var i;
    var j;
    var map = { };
    for( i = 0; i < doc.length; i++ ){

        map[ doc[ i ][ 'longname' ] ] = i;
        doc[ i ][ 'children' ] = [ ];
        if( doc[ i ][ 'memberof' ] ){

            var parentExist = false;
            for( j = 0; j < doc.length; j ++ ){

                if( !parentExist && doc[ i ][ 'memberof' ] === doc[ j ][ 'longname' ] ){

                    parentExist = true;
                }
            }
            if( !parentExist ){

                doc.push( {

                    name: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        doc[ i ][ 'memberof' ].slice( doc[ i ][ 'memberof' ].lastIndexOf( "." ) + 1 ) :
                        doc[ i ][ 'memberof' ],

                    longname: doc[ i ][ 'memberof' ],
                    kind: "constant",
                    memberof: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        doc[ i ][ 'memberof' ].slice( 0, doc[ i ][ 'memberof' ].lastIndexOf( "." ) ) :
                        "",

                    children: [ ]
                } );
            }
        }
        if( doc[ i ][ 'properties' ] ){

            for( j = 0; j < doc[ i ][ 'properties'].length; j++ ){

                doc[ i ].children.push( doc[ i ][ 'properties'][ j ] );
            }
            delete doc[ i ][ 'properties'];
        }
    }
    return map;
}

/**
 * Returns tree from specified doc object using hash-map.
 * @param {Array} doc
 * @param {Object} map
 * @returns {Array}
 */
function getTree( doc, map ){

    var tree = [ ];
    try{

        for( var i = 0; i < doc.length; i++ ){

            if( doc[ i ][ 'memberof' ] && doc[ i ][ 'memberof' ].length ){

                doc[ map[ doc[ i ][ 'memberof' ] ] ].children.push( doc[ i ] );

            }else{

                tree.push( doc[ i ] );
            }
        }
    }catch( e ){

        console.log( e );
    }
    return tree;
}

/**
 * Returns specified trees nodes grouping by level.
 * @param {Array} tree
 * @returns {Array}
 */
function getLevelLayouts( tree ){

    var i, j;
    var level = 0;
    var queue = [ tree ];
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
                if( queue[ level ][ i ][ 'returns' ] ){

                    for( j = 0; j < queue[ level ][ i ][ 'returns' ].length; j++ ){

                        if( queue[ level ][ i ][ 'returns' ][ j ][ 'type' ] ){

                            queue[ level ][ i ][ 'returns' ][ j ][ 'types' ] =

                                queue[ level ][ i ][ 'returns' ][ j ][ 'type' ][ 'names' ];

                            delete queue[ level ][ i ][ 'returns' ][ j ][ 'type' ];
                        }
                    }
                }
                if( queue[ level ][ i ][ 'type' ] ){

                    queue[ level ][ i ][ 'types' ] =

                        queue[ level ][ i ][ 'type' ][ 'names' ];

                    delete queue[ level ][ i ][ 'type' ];
                }
            }
        }
        level++;
    }
    return queue;
}

/**
 * Data to files.
 * @param {Array} doc
 * @param {Object} map
 * @param {Array} tree
 * @param {Array} queue
 */
function saveFiles( doc, map, tree, queue ){

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'doc.json',

        doc );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'map.json',

        map );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'tree.json',

        tree );

    ft.saveJson(

        ft.getRootPath( ) + d +
        'lib' + d +
        'resources' + d +
        'queue.json',

        queue );
}

/**
 * Compile documentation.
 */
function compileDocument( ) {

    // Deps files update.
    comp.calculateDependencies( );

    var files = getDeps( );
    var doc = jsdoc.explainSync( {files: files} );
    var map;
    var tree;
    var queue;

    removeUnnecessary( doc );
    map = addMissingNodes( doc );
    tree = getTree( doc, map );
    queue = getLevelLayouts( JSON.parse( JSON.stringify( tree ) ) );
    saveFiles( doc, map, tree, queue );
}

module.exports = {

    compileDocument: compileDocument
};
