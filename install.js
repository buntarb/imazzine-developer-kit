// Copyright 2005 The Imazzine Developer Kit. All Rights Reserved.
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

var readline = require('readline');

/**
 * Filetools service.
 */
var ft = require( './lib/filetools.js' );

/**
 * Yaml parser.
 */
var yaml = require( 'yamljs' );

/**
 * Read line interface.
 * @type {*}
 */
var rl = readline.createInterface( {

	input: process.stdin,
	output: process.stdout
} );

if( __dirname === ft.getRootPath( ) ){

	// Terminate installing process for imazzine-developer-kit
	// project itself.

	console.log( '[' + ( new Date( ) ).toISOString() + '] Installation don\'t needed.' );
	return;
}

if( ft.getRootPath( ) +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.NODE_MODULE_FOLDER +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.IDK_FOLDER_NAME === __dirname ){

	// Start installation process.
	console.log( '[' + ( new Date( ) ).toISOString() + '] installation start...' );

	// Calculate default module name.
	var tmpModuleName = ft.getRootPath().split( ft.CONST.PATH_DELIMITER );
	tmpModuleName = tmpModuleName[ tmpModuleName.length - 1 ]
		.replace( /\W+/g, '_' )
		.toLowerCase( );

	var now = new Date( );
	var modName = '';
	var modVersion = '' +
		now.getFullYear( ) +
		( ( now.getMonth( ) + 1 ) < 10 ? '0' + ( now.getMonth( ) + 1 ) : ( now.getMonth( ) + 1 ) ) +
		now.getDate( ) + '.0.0';
	var modDescription = 'Module description.';
	var modAuthName = 'Author Name';
	var modAuthEmail = 'Email@example.com';
	var modLicense = 'Apache-2.0';
	var modHomepage = 'http://www.example.com';
	var modRepoType = 'git';
	var modRepoUrl = 'git+https://github.com/author/' + tmpModuleName + '.git';

	rl.question( 'Please enter module name [' + tmpModuleName + ']: ', function( input ){

		modName = input || tmpModuleName;
		rl.question( 'Please enter module version [' + modVersion + ']: ', function( input ){

			modVersion = input || modVersion;
			rl.question( 'Please enter module description [Module description.]: ', function( input ){

				modDescription = input || modDescription;
				rl.question( 'Please enter module author name [Author Name]: ', function( input ){

					modAuthName = input || modAuthName;
					rl.question( 'Please enter module author email [email@example.com]: ', function( input ){

						modAuthEmail = input || modAuthEmail;
						rl.question( 'Please enter module license [Apache-2.0]: ', function( input ){

							modLicense = input || modLicense;
							rl.question( 'Please enter module homepage [http://www.example.com]: ', function( input ){

								modHomepage = input || modHomepage;
								rl.question( 'Please enter module repository type [git]: ', function( input ){

									modRepoType = input || modRepoType;
									rl.question( 'Please enter module repository url [' + modRepoUrl + ']: ', function( input ){

										modRepoUrl = input || modRepoUrl;

										console.log(modName);
										console.log(modVersion);
										console.log(modDescription);
										console.log(modAuthName);
										console.log(modAuthEmail);
										console.log(modLicense);
										console.log(modHomepage);
										console.log(modRepoType);
										console.log(modRepoUrl);
										rl.close( );
									} );
								} );
							} );
						} );
					} );
				} );
			} );

		} );
	} );

//	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//		'[' + tmpModuleName + '] setting up...' );
//
//	// Creating module configuration file.
//	try{
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/config.yaml] creating...' );
//
//		var yamlString = ft.openFile( '.' + ft.CONST.PATH_DELIMITER +
//			'tpl' + ft.CONST.PATH_DELIMITER +
//			'module.yaml' );
//
//		yamlString = yamlString.replace( '[{(TITLE)}]', 'Imazzine Developer Kit - ' + tmpModuleName );
//		yamlString = yamlString.replace( '[{(NAMESPACE)}]', tmpModuleName + '' );
//		ft.saveFile( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml', yamlString );
//
//	}catch( e ){
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'Error while creating [' + ft.getRootPath( ) + '/config.yaml]' );
//
//		console.log( e );
//	}
//
//	// Creating paths for module.
//	try{
//
//		/**
//		 * Created module configuration.
//		 * @type {*}
//		 */
//		var moduleConfig = yaml.load( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.BIN + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + moduleConfig.PATH.BIN );
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + moduleConfig.PATH.LIB );
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.SOURCES + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.SOURCES );
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.MESSAGES + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.MESSAGES );
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.TEMPLATES + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.TEMPLATES );
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.RESOURCES + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.RESOURCES );
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.STYLESHEETS + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.STYLESHEETS );
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.STYLESHEETS + '/' +
//			moduleConfig.PATH.SCSS + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.SCSS);
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'[' + ft.getRootPath( ) + '/' +
//			moduleConfig.PATH.LIB + '/' +
//			moduleConfig.PATH.STYLESHEETS + '/' +
//			moduleConfig.PATH.CSS + '] creating...' );
//
//		ft.execute( 'mkdir ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
//			moduleConfig.PATH.CSS);
//
//	}catch( e ){
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'Error while creating paths' );
//
//		console.log( e );
//	}
//
//	// Copy .ignore files.
//	try{
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/.gitignore] copy...' );
//
//		ft.execute( 'cp ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
//			ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
//			'tpl' + ft.CONST.PATH_DELIMITER +
//			'.gitignore.tpl ' +
//			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			'.gitignore' );
//
//		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +
//			'[' + ft.getRootPath( ) + '/.npmignore] copy...' );
//
//		ft.execute( 'cp ' + ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
//			ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
//			'tpl' + ft.CONST.PATH_DELIMITER +
//			'.npmignore.tpl ' +
//			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
//			'.npmignore' );
//
//	}catch( e ){
//
//		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
//			'Error while copy ignore files' );
//
//		console.log( e );
//	}

}else{

	// Terminate installing process and console error.

	console.log( '[' + ( new Date( ) ).toISOString() + '] Installation error. Please check project file structure.' );
}