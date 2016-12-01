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
 * @fileoverview Declare documentation export command.
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
 * @param {string} depsFile
 * @param {RegExp} pathRegExp
 * @return  {Array}
 */
function getDeps( depsFile, pathRegExp ){

    var linksArray = [ ];
    var deps = ft.openFile( depsFile );

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

    if( ft.CONST.IS_WINDOWS_OS ){
        deps = deps + ']';
    } else {
        deps = deps + ']]';
    }

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
 * @return {Object}
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
 * @return {Array}
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
 * @return {Array}
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
 * @return {boolean}
 */
function enumsChecker( enums ) {

    var regExp = /^\{.{1,}[:]{1,}.{1,}\}$/;

    return regExp.test( enums );
}

/**
 * Mark all true enums items.
 * @param {Array} queue
 * @return {Array}
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
 * @return {object}
 */
function getPackageJson( path ) {

    var jsonRoot = path.split( d + 'lib' )[ 0 ];
    return ft.openJson( jsonRoot + d + 'package.json' );
}


/**
 * Add new properties git repository type and path of git repository to the data.
 * @param {Array} queue
 * @return {Array}
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
                data.gittype =  getPackageJson( data.path ).repository.type;

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
                filePath = filePath.split( namespace )[ 1 ].replace( new RegExp( '\\' + d, 'g' ), '/' );

                if( gitPath.lastIndexOf( "github.com" ) > -1 ){

                    //for github
                    data.gitpath = gitPath + '/blob/' + branch  + filePath + '/' + data.filename + '#L' + data.lineno;

                }else if( gitPath.lastIndexOf( "bitbucket.org" ) > -1 ){

                    //for bitbucket
                    data.gitpath = gitPath + '/src/' + branch  + filePath + '/' + data.filename + '#' + data.filename

                        + '-' + data.lineno;}
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
function saveFiles( doc, map, tree, queue, searchMapDoc ){

    var docFolder = 'jsdoc';

    if( !ft.isDirExist( ft.getRootPath( ) + d + 'lib' + d + 'resources' ) ){

        ft.createDir( ft.getRootPath( ) + d + 'lib' + d + 'resources' );
    }

    var rootDoc = ft.getRootPath( ) + d + docFolder;

    if( !ft.isDirExist( rootDoc ) ){

        ft.createDir( rootDoc );
    }

    // ft.saveJson( rootDoc + d + 'doc.json', doc );
    //
    // ft.saveJson( rootDoc + d + 'map.json', map );
    //
    // ft.saveJson( rootDoc + d + 'tree.json', tree );
    //
    // ft.saveJson( rootDoc + d + 'queue.json', queue );

    if( searchMapDoc ){

        var keys = goog.object.getKeys( searchMapDoc );
        ft.saveFile( rootDoc + d + 'searchMapDocKeys.txt', keys.sort( ).join( '\n' ) );
        ft.saveJson( rootDoc + d + 'searchMapDoc.json', searchMapDoc );
    }
}

/**
 * Compile documentation.
 */
function compileDocument( ) {

    // Deps files update.
    comp.calculateDependencies( );

    var filesDeps = getDeps( ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'deps.js', /\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g );

    var filesDepsNode = getDeps( ft.getRootPath( ) + d +
        'lib' + d +
        'sources' + d +
        'deps-node.js', /\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g );

    var uniq = {};
    var files = [];

    for( var i = 0, l = filesDeps.length; i < l; ++i ){
        if( uniq.hasOwnProperty( filesDeps[i] ) ) {
            continue;
        }

        files.push( filesDeps[i] );
        uniq[filesDeps[i]] = 1;
    }

    for( var i = 0, l = filesDepsNode.length; i < l; ++i ){
        if( uniq.hasOwnProperty( filesDepsNode[i] ) ) {
            continue;
        }

        files.push( filesDepsNode[i] );
        uniq[filesDepsNode[i]] = 1;
    }

    var doc = jsdoc.explainSync( {files: files} );

    var searchMapDoc = { };
    var membersMap = { };

    for( var o in doc){

        if( 'file' !== doc[ o ][ 'kind' ] ){

            if( doc[ o ][ 'name' ] ){

                if( searchMapDoc[ doc[ o ][ 'name' ] ] ){

                    searchMapDoc[ doc[ o ][ 'name' ] ].push( doc[ o ] );

                } else {

                    searchMapDoc[ doc[ o ][ 'name' ] ] = [ doc[ o ] ];
                }
            }

            if( doc[ o ][ 'longname' ] ){

                if( searchMapDoc[ doc[ o ][ 'longname' ] ] ){

                    searchMapDoc[ doc[ o ][ 'longname' ] ].push( doc[ o ] );

                } else {

                    searchMapDoc[ doc[ o ][ 'longname' ] ] = [ doc[ o ] ];
                }
            }

            if( doc[ o ][ 'memberof' ] ){

                var memberof = doc[ o ][ 'memberof' ];

                if( !searchMapDoc[ memberof ] ){

                    searchMapDoc[ memberof ] = [ ];
                }

                if( !membersMap[ memberof ] ){

                    membersMap[ memberof ] = [ ];
                }

                if( doc[ o ][ 'longname' ] ){

                    if( !goog.array.contains( membersMap[ memberof ], doc[ o ][ 'longname' ] ) ){

                        membersMap[ memberof ].push( doc[ o ][ 'longname' ] );
                    }
                }
            }

            if( doc[ o ][ 'meta' ]
                && doc[ o ][ 'meta' ][ 'code' ]
                && doc[ o ][ 'meta' ][ 'code' ][ 'name' ]
                && !searchMapDoc[ doc[ o ][ 'meta' ][ 'code' ][ 'name' ] ] ){

                searchMapDoc[ doc[ o ][ 'meta' ][ 'code' ][ 'name' ] ] = [ ];
            }
        }
    }

    for( var parent in membersMap ){

        var docsArray = searchMapDoc[ parent ];
        var membersArray = membersMap[ parent ];
        var longnames = [ ];

        for( var indx = 0; indx < membersArray.length; indx++ ){

            var member = membersArray[ indx ];

            if( searchMapDoc[ member ] ){

                for( var j = 0; j < searchMapDoc[ member ].length; j++ ){

                    if( !goog.array.contains( longnames, searchMapDoc[ member ][ j ][ 'longname' ] ) ){

                        docsArray.push( searchMapDoc[ member ][ j ] );
                        longnames.push( searchMapDoc[ member ][ j ][ 'longname' ] );
                    }
                }
            }
        }

        searchMapDoc[ parent ] = docsArray;
    }

    var map;
    var tree;
    var queue;

    // removeUnnecessary( doc );
    // map = addMissingNodes( doc );
    // tree = getTree( doc, map );
    // queue = getLevelLayouts( JSON.parse( JSON.stringify( tree ) ) );
    // queue = enumsMarker( queue );
    // queue = addGit( queue );
    saveFiles( doc, map, tree, queue, searchMapDoc );
}

/**
 * Compile documentation by js-dossier.
 */
function compileDocumentDossier( ){

    // Deps files update.
    comp.calculateDependencies( );

    var cmd = 'java -jar ' +

        ft.getIdkPath() + d + 'bin' + d + 'documentations' + d + 'dossier.jar' +

        ' -c ' + ft.getIdkPath() + d + 'bin' + d + 'documentations' + d + 'config.json';

    ft.execute( cmd );
}

module.exports = {

    compileJSDoc: compileDocument,
    compileDocument: compileDocumentDossier
};
