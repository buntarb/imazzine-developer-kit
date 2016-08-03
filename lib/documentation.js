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

require( 'google-closure-library' );

goog.require( 'goog.array' );
goog.require( 'goog.json' );

/**
 * Return array of JS files using by current module.
 * @returns  {Array}
 */
function getDeps( ){

    var linksArray = [ ];
    var pathRegExp = /\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g;

    var deps = ft.openFile(

        ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'deps.js' );

    deps = goog.array.slice( deps, deps.indexOf( 'goog.addDependency' ) ).toString( ).replace( /,,,/g, 'qwertyCommaqwerty');
    deps = deps.replace( /,/g, '' );
    deps = deps.replace( /qwertyCommaqwerty/g,  ',' );
    deps = deps.replace( /goog.addDependency\(/g, "[" );
    deps = deps.replace( /\);/g, "], " );
    deps = deps.replace( /'/g, "\"" );
    deps = '[' + deps;
    deps = goog.array.slice( deps, 0, -4 ).toString( ).replace( /,,,/g, 'qwertyCommaqwerty');
    deps = deps.replace( /,/g, '' );
    deps = deps.replace( /qwertyCommaqwerty/g,  ',' );
    deps = deps + ']]';
    deps = goog.json.parse( deps );
    goog.array.forEach( deps, function( item ){

        item[ 0 ] = item[ 0 ].replace( pathRegExp, "./" );
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

            goog.array.splice( doc, i, 1 );
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

                var nameValue = goog.array.slice(

                    doc[ i ][ 'memberof' ],
                        doc[ i ][ 'memberof' ].lastIndexOf( "." ) + 1 )
                    .toString( ).replace( /,/g, '');

                var memberofValue = goog.array.slice(

                    doc[ i ][ 'memberof' ],
                    0,
                    doc[ i ][ 'memberof' ].lastIndexOf( "." ) )
                    .toString( ).replace( /,/g, '');

                doc.push( {

                    name: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        nameValue :
                        doc[ i ][ 'memberof' ],

                    longname: doc[ i ][ 'memberof' ],
                    kind: "constant",
                    memberof: ~doc[ i ][ 'memberof' ].lastIndexOf( "." ) ?

                        memberofValue :
                        "",

                    children: [ ],
                    gittype: false,
                    gitpath: false
                } );
            }
        }
        if( doc[ i ][ 'properties' ] ){

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
        goog.array.forEach( doc, function( item ){

            if( item[ 'memberof' ] && item[ 'memberof' ].length ){

                doc[ map[ item[ 'memberof' ] ] ].children.push( item );

            }else{

                tree.push( item );
            }
        } );
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

    var level = 0;
    var queue = [ tree ];
    while( queue[ level ] && queue[ level ].length ){

        goog.array.forEach( queue[ level ], function( item ){

            if( item && item.children ) {

                goog.array.forEach( item.children, function( childItem ){

                    queue[ level + 1 ] = queue[ level + 1 ] || [ ];
                    queue[ level + 1 ].push( childItem );
                } );
                if( item[ 'meta' ] ){

                    item[ 'filename' ] = item[ 'meta' ][ 'filename' ];
                    item[ 'lineno' ] = item[ 'meta' ][ 'lineno' ];
                    item[ 'path' ] = item[ 'meta' ][ 'path' ];

                    if( item[ 'scope' ] === 'static' ){

                        item[ 'enums' ] = item[ 'meta' ][ 'code' ][ 'value' ];
                    }
                    if( item[ 'scope' ] === 'instance' ){

                        if( item[ 'params' ]){

                            item[ 'kind' ] = 'function';

                        }else{

                            item[ 'kind' ] = 'member';
                        }
                    }

                    delete item[ 'meta' ];
                }
                delete item.children;
                delete item.comment;

                if( item[ 'params' ] ){

                    goog.array.forEach( item[ 'params' ], function( params ){

                        if( params[ 'type' ] ){

                            params[ 'types' ] = params[ 'type' ][ 'names' ];

                            delete params[ 'type' ];
                        }
                    } );
                }
                if( item[ 'returns' ] ){

                    goog.array.forEach( item[ 'returns' ], function( returns ){

                        if( returns[ 'type' ] ){

                            returns[ 'types' ] = returns[ 'type' ][ 'names' ];

                            delete returns[ 'type' ];
                        }
                    } );
                }
                if( item[ 'type' ] ){

                    item[ 'types' ] = item[ 'type' ][ 'names' ];

                    delete item[ 'type' ];
                }
            }
        } );
        level++;
    }
    return queue;
}

/**
 * Returns true if value of enums is true enums.
 * @param {string} enums
 * @returns {boolean}
 */
function enumsChecker( enums ) {

    var regExp = /^\{.{1,}[:]{1,}.{1,}\}$/;

    return regExp.test( enums );
}

/**
 * Mark all true enums items.
 * @param {Array} queue
 * @returns {Array}
 */
function enumsMarker( queue ) {

    goog.array.forEach( queue, function( levelData ){

        goog.array.forEach( levelData, function( data ){

            if( data.kind === 'member'
                && data.scope === 'static'
                && data.enums
                && enumsChecker( data.enums ) ){


                data.kind = 'enums';

            }
        } );
    } );

    goog.array.forEach( queue, function( levelData ){

        goog.array.forEach( levelData, function( data ){

            if( data.kind === 'member'
                && data.enums ){

                goog.array.forEach( queue, function( levelDataInner ){

                    goog.array.forEach( levelDataInner, function( dataInner ){

                        if( dataInner.longname === data.memberof && dataInner.kind === 'enums' ){

                            data.kind = 'enums_value';
                        }
                    } );
                } );
            }
        } );
    } );

    return queue;
}

/**
 * Returns object of package.json file due to js file path.
 * @param {string} path
 * @returns {object}
 */
function getPackageJson( path ) {

    var jsonRoot = path.split( '/lib' )[ 0 ];
    return ft.openJson( jsonRoot + d + 'package.json' );
}


/**
 * Add new properties git repository type and path of git repository to the data.
 * @param {Array} queue
 * @returns {Array}
 */
function addGit( queue ) {

    goog.array.forEach( queue, function( levelData ){

        goog.array.forEach( levelData, function( data ){

            if( data.path ){

                var filePath;
                var gitPath;
                var namespace;
                var additionalGitPath;
                var branch = 'master';

                data.gitType =  getPackageJson( data.path ).repository.type;

                gitPath =  getPackageJson( data.path ).repository.url;
                gitPath = goog.array.slice(

                    gitPath,
                    gitPath.lastIndexOf( "+" ) + 1 ).toString( ).replace( /,/g, '');

                gitPath = gitPath.split( '.git' )[ 0 ];

                additionalGitPath = gitPath;

                namespace = goog.array.slice(

                    additionalGitPath,
                    additionalGitPath.lastIndexOf( "/" ) + 1 ).toString( ).replace( /,/g, '');

                filePath = data.path;

                filePath = filePath.split( namespace )[ 1 ];

                if( gitPath.lastIndexOf( "github.com" ) > -1 ){

                    //for github

                    data.gitPath = gitPath + '/blob/' + branch  + filePath + '/' + data.filename + '#L' + data.lineno;

                }else if( gitPath.lastIndexOf( "bitbucket.org" ) > -1 ){

                    //for bitbucket
                    data.gitPath = gitPath + '/src/' + branch  + filePath + '/' + data.filename + '#' + data.filename

                        + '-' + data.lineno;

                }
            }
        } );
    } );
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

    if( !ft.isDirExist( ft.getRootPath( ) + d + 'lib' + d + 'resources' ) ){

        ft.createDir( ft.getRootPath( ) + d + 'lib' + d + 'resources' );
    }
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
    queue = enumsMarker( queue );
    queue = addGit( queue );
    saveFiles( doc, map, tree, queue );
}

module.exports = {

    compileDocument: compileDocument
};
