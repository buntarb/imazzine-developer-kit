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
 * @fileoverview IDK installation file.
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

// Copy command files.
try{

	var moduleConfig = yaml.load(

		ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );

	if( !ft.isDirExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + moduleConfig.PATH.BIN ) ){

		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

			'[' + ft.getRootPath( ) + '/' +
			moduleConfig.PATH.BIN + '] creating...' );

		ft.execute(

			'mkdir ' +

				ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
				moduleConfig.PATH.BIN );
	}

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/idk] copy...' );

	ft.execute(

		'cp ' +

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
			ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
			'tpl' + ft.CONST.PATH_DELIMITER +
			'cmd' + ft.CONST.PATH_DELIMITER + 'idk ' +
			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'idk' );

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/idk] change permissions...' );

	ft.execute(

		'chmod u+x ' +

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'idk' );

}catch( e ){

	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Error while copy command files' );

	console.log( e );
}

// Copy .ignore files.
try{

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/.gitignore] copy...' );

	ft.execute(

		'cp ' +

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
			ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
			'tpl' + ft.CONST.PATH_DELIMITER + '.gitignore.tpl ' +
			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + '.gitignore' );

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/.npmignore] copy...' );

	ft.execute(

		'cp ' +

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
			ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
			'tpl' + ft.CONST.PATH_DELIMITER + '.npmignore.tpl ' +
			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + '.npmignore' );

}catch( e ){

	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Error while copy ignore files' );

	console.log( e );
}

// TODO: Add real production condition here.
if( __dirname === ft.getRootPath( ) || (

		ft.isDirExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' ) &&

		ft.isDirExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'sources' ) &&

		ft.isFileExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'sources' + ft.CONST.PATH_DELIMITER +
			'base.js' ) &&

		ft.isFileExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'sources' + ft.CONST.PATH_DELIMITER +
			'cssmap.js' ) &&

		ft.isDirExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'stylesheets' ) &&

		ft.isDirExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'stylesheets' + ft.CONST.PATH_DELIMITER +
			'scss' ) &&

		ft.isFileExist(

			ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
			'lib' + ft.CONST.PATH_DELIMITER +
			'stylesheets' + ft.CONST.PATH_DELIMITER +
			'scss'+ ft.CONST.PATH_DELIMITER +
			'deps.scss' ) ) ){

	// Terminate installing process for imazzine-developer-kit project itself.
	console.log( '[' + ( new Date( ) ).toISOString() + '] done, press [ctrl + c] to finish' );
	process.exit( 0 );
}

if( ft.getRootPath( ) +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.NODE_MODULE_FOLDER +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.IDK_FOLDER_NAME === __dirname ){

	// Start installation process.
	console.log( '[' + ( new Date( ) ).toISOString() + '] installation start...' );

	// Calculate default module name.
	var tmpModuleName = ft.getRootPath( ).split( ft.CONST.PATH_DELIMITER );
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
										rl.close( );

										console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

											'[' + modName + '] setting up...' );

										// Creating module configuration file.
										try{

											var fileString;

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/config.yaml] creating...' );

											fileString = ft.openFile(

												'.' + ft.CONST.PATH_DELIMITER +
												'tpl' + ft.CONST.PATH_DELIMITER +
												'module.yaml' )
												.replace(

													/\[\{\(NAMESPACE\)\}\]/g,
													modName + '' );

											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml',
												fileString );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/config.yaml]' );

											console.log( e );
										}

										// Creating license file.
										try{

											var licenseString;

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/LICENSE] creating...' );

											fileString = ft.openFile(

													'.' + ft.CONST.PATH_DELIMITER +
													'tpl' + ft.CONST.PATH_DELIMITER +
													'LICENSE' );

											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'LICENSE',
												fileString );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/LICENSE]' );

											console.log( e );
										}

										// Creating module package.json.
										try{

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/package.json] creating...' );

											var packageJson = ft.openFile(

												'.' + ft.CONST.PATH_DELIMITER +
												'tpl' + ft.CONST.PATH_DELIMITER +
												'package.tpl' );

											packageJson = packageJson.replace( /\[\{\(NAMESPACE\)\}\]/g, modName );
											packageJson = packageJson.replace( /\[\{\(VERSION\)\}\]/g, modVersion );
											packageJson = packageJson.replace( /\[\{\(DESCRIPTION\)\}\]/g, modDescription );
											packageJson = packageJson.replace( /\[\{\(AUTHOR\)\}\]/g, modAuthName );
											packageJson = packageJson.replace( /\[\{\(EMAIL\)\}\]/g, modAuthEmail );
											packageJson = packageJson.replace( /\[\{\(LICENSE_TYPE\)\}\]/g, modLicense );
											packageJson = packageJson.replace( /\[\{\(HOMEPAGE\)\}\]/g, modHomepage );
											packageJson = packageJson.replace( /\[\{\(REPO_TYPE\)\}\]/g, modRepoType );
											packageJson = packageJson.replace( /\[\{\(REPO_URL\)\}\]/g, modRepoUrl );
											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'package.json',
												packageJson );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/config.yaml]' );

											console.log( e );
										}

										// Creating paths for module.
										try{

											/**
											 * Created module configuration.
											 * @type {*}
											 */
											var moduleConfig = yaml.load(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/controllers] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/controllers' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/models] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/models' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/views] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/views' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/events] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/events' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/services] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/services' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/tests] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/tests' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/factories] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/factories' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/errors] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/errors' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/enums] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/enums' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/docs] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + '/docs' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.MESSAGES + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.MESSAGES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.TEMPLATES + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.TEMPLATES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.RESOURCES + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.RESOURCES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.STYLESHEETS );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '/' +
												moduleConfig.PATH.SCSS + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SCSS);

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '/' +
												moduleConfig.PATH.CSS + '] creating...' );

											ft.execute(

												'mkdir ' +

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.CSS);

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating paths' );

											console.log( e );
										}

										// Creating base.js.
										try{

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'/base.js] creating...' );

											var baseJs = ft.openFile(

												'.' + ft.CONST.PATH_DELIMITER +
													'tpl' + ft.CONST.PATH_DELIMITER +
													'base.js.tpl' );

											baseJs = baseJs.replace( /\[\{\(NAMESPACE\)\}\]/g, modName );
											baseJs = baseJs.replace( /\[\{\(AUTHOR\)\}\]/g, modAuthName );
											baseJs = baseJs.replace( /\[\{\(EMAIL\)\}\]/g, modAuthEmail );
											baseJs = baseJs.replace( /\[\{\(LICENSE_TYPE\)\}\]/g, modLicense );
											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +

													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + ft.CONST.PATH_DELIMITER +
													'base.js',

												baseJs );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'/cssmap.js] creating...' );

											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +

													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SOURCES + ft.CONST.PATH_DELIMITER +
													'cssmap.js',

												'' );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'/base.js]' );

											console.log( e );
										}

										// Creating module.scss, deps.scss.
										try{

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '/' +
												modName + '.scss] creating...' );

											var moduleScss = ft.openFile(

												'.' + ft.CONST.PATH_DELIMITER +
													'tpl' + ft.CONST.PATH_DELIMITER +
													'module.scss.tpl' );

											moduleScss = moduleScss.replace( /\[\{\(NAMESPACE\)\}\]/g, modName );
											moduleScss = moduleScss.replace( /\[\{\(AUTHOR\)\}\]/g, modAuthName );
											moduleScss = moduleScss.replace( /\[\{\(EMAIL\)\}\]/g, modAuthEmail );
											moduleScss = moduleScss.replace( /\[\{\(LICENSE_TYPE\)\}\]/g, modLicense );
											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +

													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SCSS + ft.CONST.PATH_DELIMITER +
													modName + '.scss',

												moduleScss );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'deps.scss] creating...' );

											var depsScss = ft.openFile(

												'.' + ft.CONST.PATH_DELIMITER +
													'tpl' + ft.CONST.PATH_DELIMITER +
													'deps.scss.tpl' );

											depsScss = depsScss.replace( /\[\{\(NAMESPACE\)\}\]/g, modName );
											depsScss = depsScss.replace( /\[\{\(AUTHOR\)\}\]/g, modAuthName );
											depsScss = depsScss.replace( /\[\{\(EMAIL\)\}\]/g, modAuthEmail );
											depsScss = depsScss.replace( /\[\{\(LICENSE_TYPE\)\}\]/g, modLicense );
											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +

													moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
													moduleConfig.PATH.SCSS + ft.CONST.PATH_DELIMITER +
													'deps.scss',

												depsScss );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'/base.js]' );

											console.log( e );
										}
									} );
								} );
							} );
						} );
					} );
				} );
			} );

		} );
	} );
}else{

	// Terminate installing process and console error.
	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Installation error. Please check project file structure.' );
}