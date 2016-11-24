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
 * @fileoverview Imazzine Developer Kit NodeJs index file. This file must be
 * used instead of ./goog/bootstrap/nodejs.js.
 * @nocompile
 */

// Persistent modules requiring.
var filetools = require( './lib/filetools.js' );
var compiler = require( './lib/compiler.js' );
var documentation = require( './lib/documentation.js' );
var template = require( './lib/template.js' );
var stylesheet = require( './lib/stylesheet.js' );
var server = require( './lib/server.js' );
var yaml = require( 'yamljs' );
var ws = require( 'ws' );
var ide = require( './lib/ide.js' );
var ternserver = require( './lib/ternserver.js' );

// Base environment variables.
var d = filetools.CONST.PATH_DELIMITER;
var cfg = yaml.load( filetools.getRootPath( ) + d + 'config.yaml' );

// GCL nodejs module requiring.
require( './node_modules/google-closure-library/closure/goog/bootstrap/nodejs.js' );

// Module dependencies for node if exist.
if( filetools.isFileExist(

		filetools.getRootPath( ) + d +
		cfg.PATH.LIB + d +
		cfg.PATH.SOURCES + d +
		'deps-node.js' ) ){

	require(

		filetools.getRootPath( ) + d +
		cfg.PATH.LIB + d +
		cfg.PATH.SOURCES + d +
		'deps-node.js' );
}

// Exporting API
module.exports = {

	filetools: filetools,
	compiler: compiler,
	documentation: documentation,
	template: template,
	stylesheet: stylesheet,
	server: server,
	ws: ws,
	ide: ide,
	ternserver: ternserver
};