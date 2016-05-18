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
 * @fileoverview Definitions for the imazzine-developer-kit module.
 * @author buntarb@gmail.com (Artem Lytvynov)
 * @externs
 */

/**
 BEGIN_NODE_INCLUDE
 var idk = require('imazzine-developer-kit');
 END_NODE_INCLUDE
 */

//noinspection FunctionWithInconsistentReturnsJS

/**
 *
 * @type {{ws: Function}}
 */
var idk = {

	/**
	 * @type {Object}
	 */
	filetools: { },

	/**
	 * @type {Object}
	 */
	compiler: { },

	/**
	 * @type {Object}
	 */
	template: { },

	/**
	 * @type {Object}
	 */
	stylesheet: { },

	/**
	 * @type {Object}
	 */
	server: { },

	/**
	 * @param {string} path
	 * @return {ws.WebSocket}
	 */
	ws: function( path ){ }
};