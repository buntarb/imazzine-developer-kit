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
 */


var path = require('path');
var os = require('os'), isWin = ( os.platform( ) === 'win32' );

/**
 * A simple class for mapping class names to origin files which pre-populates a
 * map of names to files by using Closure's deps.
 * @param {string} projectDir The Tern project directory.
 * @param {{name: string, debug: boolean, dirs: Array.<string>}} options
 * @constructor
 */
var DepsFileFinder = function( projectDir, options ) {

    /**
     * A map of class names to canonical file paths.
     * @type {Object.<string>}
     * @private
     */
    this.files_ = { };

    /** @private {string} The project dir. */
    this.projectDir_ = projectDir;

    /** @private {{name: string, debug: boolean, dirs: Array.<string>}} */
    this.options_ = options;

    setTimeout( function( ) {

        this.prepopulate_( );

    }.bind( this ) );
};
module.exports = DepsFileFinder;


/**
 * Pre-populates the internal file map.
 * @private
 */
DepsFileFinder.prototype.prepopulate_ = function( ) {

    var d = isWin? '\\': '/';

    for( var name in goog.dependencies_.nameToPath ){

        var filePath = path.resolve( this.projectDir_, goog.getPathFromDeps_( name ).replace( /\.\.\//g, '' ) );

        if ( filePath.indexOf( this.projectDir_ ) === 0 ) {

            filePath = path.relative( this.projectDir_, filePath );
        }

        if( goog.string.startsWith( filePath, '/' ) ){

            filePath = filePath.substring( 1 );

        }
        if( goog.string.startsWith( name, 'goog.' ) ){

            filePath = 'node_modules'
                + d + 'imazzine-developer-kit'
                + d + 'node_modules'
                + d + 'google-closure-library'
                + d + 'closure'
                + d + 'goog'
                + d + filePath;
        }

        this.files_[ name ] = filePath;
    }
};

/**
 * @param {string} name
 * @param {fn(string)} cb
 */
DepsFileFinder.prototype.findFile = function( name, cb ) {

    setTimeout( function( ) {

        cb( this.files_[name] );

    }.bind( this ) );
};
