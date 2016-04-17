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
 * @fileoverview Module installation file.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**
 * IDK service.
 */
var idk = require( 'imazzine-developer-kit' );

/**
 * File tools.
 * @type {*}
 */
var ft = idk.filetools;

/**
 * OS folder delimiter.
 * @type {string}
 */
var d = ft.CONST.PATH_DELIMITER;

// Check installation necessary.
if( __dirname === idk.filetools.getRootPath( ) ){

	// Terminate installing process for IDK or module project itself.
	console.log( '[' + ( new Date( ) ).toISOString() + '] Installation don\'t needed.' );
	return;
}

/**
 * Node modules folder.
 */
var nmf = __dirname.split( idk.filetools.CONST.PATH_DELIMITER );
	nmf.pop( );
	nmf = nmf.join( idk.filetools.CONST.PATH_DELIMITER );

if( ft.getRootPath( ) +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.NODE_MODULE_FOLDER === nmf ){

	var targetDeps = ft.openYaml( ft.getRootPath( ) + d + 'dependencies.yaml' );
	var sourceConf = ft.openYaml( __dirname + d + 'config.yaml' );
	var sourceDeps = ft.openYaml( __dirname + d + 'dependencies.yaml' );
	if( typeof targetDeps[ sourceConf.NAMESPACE ] == 'undefined' ){

		targetDeps[ sourceConf.NAMESPACE ] = __dirname;
	}
//	for( var dep in sourceDeps ){
//
//		if( typeof targetDeps[ dep ] == 'undefined' ){
//
//			targetDeps[ dep ] = __dirname;
//		}
//	}
	ft.saveYaml( ft.getRootPath( ) + d + 'dependencies.yaml', targetDeps );
}