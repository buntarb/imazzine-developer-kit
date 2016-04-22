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
 * @fileoverview
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

var filetools = require( './lib/filetools.js' );
var compiler = require( './lib/compiler.js' );
var template = require( './lib/template.js' );
var stylesheet = require( './lib/stylesheet.js' );
var server = require( './lib/server.js' );

module.exports = {

	filetools: filetools,
	compiler: compiler,
	template: template,
	stylesheet: stylesheet,
	server: server
};