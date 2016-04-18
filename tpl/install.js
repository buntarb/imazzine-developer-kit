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

var nmf = __dirname.split( idk.filetools.CONST.PATH_DELIMITER );
nmf.pop( );
nmf = nmf.join( idk.filetools.CONST.PATH_DELIMITER );

if( ft.getRootPath( ) +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.NODE_MODULE_FOLDER === nmf ){

	var targetConf = ft.openYaml( ft.getRootPath( ) + d + 'config.yaml' );
	var sourceConf = ft.openYaml( __dirname + d + 'config.yaml' );
	var targetDeps = ft.openYaml( ft.getRootPath( ) + d + 'dependencies.yaml' );
		targetDeps = targetDeps ? targetDeps : {};
	var sourceDeps = ft.openYaml( __dirname + d + 'dependencies.yaml' );
		sourceDeps = sourceDeps ? sourceDeps : {};
	var targetScss = ft.openFile(

		ft.getRootPath( ) + d +

			targetConf.PATH.LIB + d +
			targetConf.PATH.STYLESHEETS + d +
			targetConf.PATH.SCSS + d + 'deps.scss' );

	if( typeof targetDeps[ sourceConf.NAMESPACE ] == 'undefined' ){

		targetDeps[ sourceConf.NAMESPACE ] = __dirname.split( ft.getRootPath( ) )[ 1 ];

		targetScss = targetScss + "\n";
		targetScss = targetScss + "@import \"" +

			"../../.." +
			targetDeps[ sourceConf.NAMESPACE ] + '/' +
			sourceConf.PATH.LIB + '/' +
			sourceConf.PATH.STYLESHEETS + '/' +
			sourceConf.PATH.SCSS + '/' +
			sourceConf.NAMESPACE + "\";";

	}else{

		console.log( sourceConf.NAMESPACE + ' already installed!' );
		console.log( 'Please, remove this dependency from package.json.' );
	}
	for( var dep in sourceDeps ){

		if( typeof targetDeps[ dep ] == 'undefined' ){

			targetDeps[ dep ] = __dirname.split(

				ft.getRootPath( ) )[ 1 ] +
				sourceDeps[ dep ];

			// Sub dependency already added in modules deps.scss
//			var depConf = ft.openYaml( ft.getRootPath( ) + targetDeps[ dep ] + d + 'config.yaml' );
//			targetScss = targetScss + "\n";
//			targetScss = targetScss + "@import \"" +
//
//				"../../.." +
//				targetDeps[ dep ] + '/' +
//				depConf.PATH.LIB + '/' +
//				depConf.PATH.STYLESHEETS + '/' +
//				depConf.PATH.SCSS + '/' +
//				depConf.NAMESPACE + "\";";
		}
	}
	ft.saveYaml( ft.getRootPath( ) + d + 'dependencies.yaml', targetDeps );
	ft.saveFile(

		ft.getRootPath( ) + d +
			targetConf.PATH.LIB + d +
			targetConf.PATH.STYLESHEETS + d +
			targetConf.PATH.SCSS + d + 'deps.scss',

		targetScss);
}