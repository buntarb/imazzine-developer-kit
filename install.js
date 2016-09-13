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

var fileFrom, fileTo;

/**
 * Read line interface.
 * @type {*}
 */
var rl = readline.createInterface( {

	input: process.stdin,
	output: process.stdout
} );

/**
 * Copy html templates to module's srv.
 * @param {string} template's file name
 * @private
 */
function _copyIndexHtmlTemplateIfNotExist( template ) {

	var fileTo = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'srv' + ft.CONST.PATH_DELIMITER + template;

	if( !ft.isFileExist( fileTo ) ){

		try{

			console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

				'[' + fileTo + '] copy...' );

			var fileFrom = ft.getIdkPath() + ft.CONST.PATH_DELIMITER + 'tpl' + ft.CONST.PATH_DELIMITER + template;

			if(!ft.copyFile( fileFrom, fileTo )){

				throw new Error("Can't copy [" + fileFrom + "] to [" + fileTo + "]");
			}

		}catch( e ){

			console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

				'Error while copy index.html template' );

			console.log( e );
		}
	}
}

var createBinDir = function ( ) {

	var isCreated = false;

	if( ft.isFileExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' )){

		try{

			var moduleConfig = yaml.load(

				ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml' );

			if( !ft.isDirExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + moduleConfig.PATH.BIN ) ){

				console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

					'[' + ft.getRootPath( ) + '/' +
					moduleConfig.PATH.BIN + '] creating...' );

				ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
					moduleConfig.PATH.BIN );

				isCreated = ft.isDirExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
					moduleConfig.PATH.BIN );
			}
		}catch( e ){

			console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

				'Error create ' +  ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
				moduleConfig.PATH.BIN);

			console.log( e );
		}
	}

	return isCreated;
}

var isCreatedBinDir = createBinDir();

// Copy command files.
try{

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/idk] copy...' );

	fileFrom = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
		ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
		ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
		'tpl' + ft.CONST.PATH_DELIMITER +
		'cmd' + ft.CONST.PATH_DELIMITER + 'idk';

	fileTo = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'idk';

	if(!ft.copyFile( fileFrom, fileTo )){

		throw new Error("Can't copy [" + fileFrom + "] to [" + fileTo + "]");
	}

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/idk] change permissions...' );

	if( !ft.CONST.IS_WINDOWS_OS ){

		ft.setFilePermission(

			ft.getRootPath( ) +
			ft.CONST.PATH_DELIMITER +
			'idk',
			( 0400 | 0200 | 0100 | 0040 | 0020 | 0004 ) );
	}else{

		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +
			'setFilePermission is not supported on Windows platform' );
	}

}catch( e ){

	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Error while copy command files' );

	console.log( e );
}

//Copy idk.cmd for run idk in Windows
try{

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/idk.cmd] copy...' );

	fileFrom = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
		ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
		ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
		'tpl' + ft.CONST.PATH_DELIMITER + 'idk.cmd.tpl';

	fileTo = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'idk.cmd';

	if(!ft.copyFile( fileFrom, fileTo )){

		throw new Error("Can't copy [" + fileFrom + "] to [" + fileTo + "]");
	}
}catch( e ){

	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Error while copy idk.cmd command file' );

	console.log( e );
}

//Create idk alias in Unix
if( !ft.CONST.IS_WINDOWS_OS ){
	try{

		var res = ft.execute( 'cat ~/.bashrc');
		if( res && !/alias\s*idk\s*=\s*['"]\.\/idk['"]/.test( res.toString() ) ){

			var aliasIdk = 'echo "alias idk=\'./idk\'" >> ~/.bashrc';
			res = ft.execute( aliasIdk );
			res = ft.execute( '. ~/.bashrc' );  //doesn't work for current session
		}

	}catch( e ){

		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

			'Error while creating idk alias' );

		console.log( e );
	}
}

// Copy .ignore files.
try{

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/.gitignore] copy...' );


	fileFrom = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
		ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
		ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
		'tpl' + ft.CONST.PATH_DELIMITER + '.gitignore.tpl';

	fileTo = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + '.gitignore';

	if(!ft.copyFile( fileFrom, fileTo )){

		throw new Error("Can't copy [" + fileFrom + "] to [" + fileTo + "]");
	}

	console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

		'[' + ft.getRootPath( ) + '/.npmignore] copy...' );

	fileFrom = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
		ft.CONST.NODE_MODULE_FOLDER + ft.CONST.PATH_DELIMITER +
		ft.CONST.IDK_FOLDER_NAME + ft.CONST.PATH_DELIMITER +
		'tpl' + ft.CONST.PATH_DELIMITER + '.npmignore.tpl';

	fileTo = ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + '.npmignore';

	if(!ft.copyFile( fileFrom, fileTo )){

		throw new Error("Can't copy [" + fileFrom + "] to [" + fileTo + "]");
	}

}catch( e ){

	console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

		'Error while copy ignore files' );

	console.log( e );
}

// Copy index.html templates for different environments
if( !ft.isDirExist( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'srv' ) ){

	try{
		console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

			'[' + ft.getRootPath( ) + '/srv] creating...' );

		ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'srv' );

	}catch( e ){

		console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

			'Error create ' +  ft.getRootPath( ) + '/srv');

		console.log( e );
	}
}

_copyIndexHtmlTemplateIfNotExist( 'index.app.header.tpl' );
_copyIndexHtmlTemplateIfNotExist( 'index.app.footer.tpl' );
_copyIndexHtmlTemplateIfNotExist( 'index.dev.tpl' );
_copyIndexHtmlTemplateIfNotExist( 'index.tst.tpl' );
_copyIndexHtmlTemplateIfNotExist( 'index.doc.tpl' );
_copyIndexHtmlTemplateIfNotExist( 'index.ut.tpl' );

// TODO: Add real production condition here.
if( __dirname === ft.getRootPath( ) ||
	ft.isFileExist( ft.getRootPath() + ft.CONST.PATH_DELIMITER + 'config.yaml' ) ||
	(

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
	console.log( '[' + ( new Date( ) ).toISOString() + '] done' );
	process.exit( 0 );

}else if( ft.getRootPath( ) +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.NODE_MODULE_FOLDER +
	ft.CONST.PATH_DELIMITER +
	ft.CONST.IDK_FOLDER_NAME === __dirname ){

	// Start installation process.
	console.log( '[' + ( new Date( ) ).toISOString() + '] installation start...' );

	var idkRoot = ft.getRootPath( ) +
		ft.CONST.PATH_DELIMITER +
		ft.CONST.NODE_MODULE_FOLDER +
		ft.CONST.PATH_DELIMITER +
		ft.CONST.IDK_FOLDER_NAME;

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
										var fileString;
										try{

											if( !ft.isFileExist( ft.getRootPath( ) +
													ft.CONST.PATH_DELIMITER + 'config.yaml' ) ){

												console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

													'[' + ft.getRootPath( ) + '/config.yaml] creating...' );


												fileString = ft.openFile(

													idkRoot + ft.CONST.PATH_DELIMITER +
													'tpl' + ft.CONST.PATH_DELIMITER +
													'module.yaml' )
													.replace(

														/\[\{\(NAMESPACE\)\}\]/g,
														modName + '' );

												ft.saveFile(

													ft.getRootPath( ) + ft.CONST.PATH_DELIMITER + 'config.yaml',
													fileString );
											}
										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/config.yaml]' );

											console.log( e );
										}

										if( !isCreatedBinDir ){

											isCreatedBinDir = createBinDir();
										}

										// Creating license file.
										try{

											var licenseString;

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/LICENSE] creating...' );

											fileString = ft.openFile(

												idkRoot + ft.CONST.PATH_DELIMITER +
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

											if( !ft.isFileExist( ft.getRootPath( ) +
													ft.CONST.PATH_DELIMITER + 'package.json' ) ){

												console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

													'[' + ft.getRootPath( ) + '/package.json] creating...' );

												var packageJson = ft.openFile(

													idkRoot + ft.CONST.PATH_DELIMITER +
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
											}

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/package.json]' );

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

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/controllers] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'controllers' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/models] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'models' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/views] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'views' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/events] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'events' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/services] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'services' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/tests] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'tests' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/factories] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'factories' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/errors] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'errors' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/enums] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'enums' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/docs] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES +
												ft.CONST.PATH_DELIMITER + 'docs' );

											console.log( '[' + ( new Date( ) ).toISOString( ) + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.MESSAGES + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.MESSAGES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.TEMPLATES + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.TEMPLATES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.RESOURCES + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.RESOURCES );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.STYLESHEETS );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '/' +
												moduleConfig.PATH.SCSS + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SCSS );

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.STYLESHEETS + '/' +
												moduleConfig.PATH.CSS + '] creating...' );

											ft.createDir( ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.STYLESHEETS + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.CSS );

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
												'base.js] creating...' );

											var baseJs = ft.openFile(

												idkRoot + ft.CONST.PATH_DELIMITER +
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
												'cssmap.js] creating...' );

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
												'base.js]' );

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

												idkRoot + ft.CONST.PATH_DELIMITER +
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

												idkRoot + ft.CONST.PATH_DELIMITER +
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

												'Error while creating [module.scss, deps.scss]' );

											console.log( e );
										}

										// Creating index.js for unit tests.
										try{

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'[' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'tests/' +
												'index.js] creating...' );

											var utJs = ft.openFile(

												idkRoot + ft.CONST.PATH_DELIMITER +
												'tpl' + ft.CONST.PATH_DELIMITER +
												'ut.js.tpl' );

											utJs = utJs.replace( /\[\{\(NAMESPACE\)\}\]/g, modName );
											utJs = utJs.replace( /\[\{\(AUTHOR\)\}\]/g, modAuthName );
											utJs = utJs.replace( /\[\{\(EMAIL\)\}\]/g, modAuthEmail );
											utJs = utJs.replace( /\[\{\(LICENSE_TYPE\)\}\]/g, modLicense );

											ft.saveFile(

												ft.getRootPath( ) + ft.CONST.PATH_DELIMITER +

												moduleConfig.PATH.LIB + ft.CONST.PATH_DELIMITER +
												moduleConfig.PATH.SOURCES + ft.CONST.PATH_DELIMITER +
												'tests' + ft.CONST.PATH_DELIMITER +
												'index.js',

												utJs );

										}catch( e ){

											console.log( '[' + ( new Date( ) ).toISOString() + '] ' +

												'Error while creating [' + ft.getRootPath( ) + '/' +
												moduleConfig.PATH.LIB + '/' +
												moduleConfig.PATH.SOURCES + '/' +
												'tests/index.js]' );

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