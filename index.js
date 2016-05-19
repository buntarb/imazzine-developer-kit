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
 * @fileoverview Imazzine Developer Kit NodeJs index file. This file must be
 * used instead of ./goog/bootstrap/nodejs.js.
 * @author buntarb@gmail.com (Artem Lytvynov)
 * @nocompile
 */

// Persistent modules requiring.
var filetools = require( './lib/filetools.js' );
var compiler = require( './lib/compiler.js' );
var template = require( './lib/template.js' );
var stylesheet = require( './lib/stylesheet.js' );
var server = require( './lib/server.js' );
var ws = require( 'ws' );

// GCL nodejs module requiring.
require( './node_modules/google-closure-library/closure/goog/bootstrap/nodejs.js' );

// Module dependencies for node if exist.
if( filetools.isFileExist( '../../lib/sources/deps-node.js' ) ){

	require( '../../lib/sources/deps-node.js' );
}

// Exporting API
module.exports = {

	filetools: filetools,
	compiler: compiler,
	template: template,
	stylesheet: stylesheet,
	server: server,
	ws: ws
};