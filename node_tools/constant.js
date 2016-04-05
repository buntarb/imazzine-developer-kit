// Copyright 2005 The ZZ Library Authors. All Rights Reserved.
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

/**********************************************************************************************************************
 * File overview section                                                                                              *
 **********************************************************************************************************************/

/**
 * @fileoverview Constants.
 * @author buntarb@gmail.com (Artem Lytvynov)
 */

/**********************************************************************************************************************
 * Constants                                                                                                          *
 **********************************************************************************************************************/

/**
 * Windows OS flag.
 * @type {Boolean}
 */
var IS_WINDOWS = /windows/i.test( process.env.OS );

/**
 * Defaults
 * @type {Object}
 */
var DEFAULTS = {

	TITLE: 'zz.Framework!',
	LOCALE: 'en',
	NAMESPACE: 'zz',
	SOURCE_MAP: 'V3',
	SOURCE_MAP_ENABLE: true,
	COMPILE_LEVEL: 'ADVANCED_OPTIMIZATIONS',
	INPUT_LANGUAGE: 'ECMASCRIPT5_STRICT',
	OUTPUT_LANGUAGE: 'ECMASCRIPT5_STRICT',
	SERVER_DEV: 'dev',
	SERVER_TST: 'tst',
	SERVER_APP: 'app',
	SERVER_DOMAIN: 'localhost',
	SERVER_PORT: 8888
};

/**
 * Project path.
 * @type {Object}
 */
var PATH = {

	ROOT: ( IS_WINDOWS ? process.env.HOMEDRIVE : '' ) + '/var/www/front-end',
	TOOLS: '/tools',
	APPLICATION: '/app',
	MESSAGES: '/messages',
	TEMPLATES: '/templates',
	RESOURCES: '/resources',
	STYLESHEETS: {

		ROOT: '/stylesheets',
		SCSS: '/scss',
		GSS: '/_gss',
		CSS: '/_css'
	},
	GOOG: {

		ROOT: '/node_modules/google-closure-library-latest/lib',
		BASE: '/closure/goog',
		GOOG3P: '/third_party/closure'
	},
	SOURCES: {

		ROOT: '/sources/zz',
		TEMPLATE: '/_template',
		STYLESHEET: '/_stylesheet'
	},
	DOCUMENTATION: '/docs'
};

/**
 * Project files.
 * @type {Object}
 */
var FILE = {

	ROOT_SCSS: 'zz.scss',
	REMAP_TPL: 'remap.tpl',
	REMAP1_TPL: 'remap1.tpl',
	REMAP_DAT: 'remap.dat',
	REMAP_JS: 'remap.js',
	DEPS_JS: 'deps.js',
	APP_JS: 'zz.js',
	MAP_JS: 'zz.js.map'
};

/**
 * Google Closure Tools binary files.
 * @type {Object}
 */
var TOOLS = {

	BUILDER: PATH.ROOT + PATH.GOOG.ROOT + '/closure/bin/build/closurebuilder.py',
	CALCDEPS: PATH.ROOT + PATH.GOOG.ROOT + '/closure/bin/calcdeps.py',
	COMPILER: PATH.ROOT + PATH.TOOLS + '/compiler/compiler.jar',
	MESSAGES: PATH.ROOT + PATH.TOOLS + '/messages/SoyMsgExtractor.jar',
	TEMPLATES: PATH.ROOT + PATH.TOOLS + '/templates/SoyToJsSrcCompiler.jar',
	STYLESHEETS: PATH.ROOT + PATH.TOOLS + '/stylesheets/closure-stylesheets.jar',
	DOSSIER: PATH.ROOT + PATH.TOOLS + '/js-dossier/gendossier.sh'
};

/**********************************************************************************************************************
 * Templates                                                                                                          *
 **********************************************************************************************************************/

var TEMPLATE = {

	APP1:

		'<!DOCTYPE html>' +
		'<html>' +
			'<head>' +
				'<meta charset="utf-8">' +
				'<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
				'<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">' +
				'<title>' +
					'[{(TITLE)}]' +
				'</title>' +
				'<style>' +
					'[{(STYLE)}]' +
				'</style>' +
				'<script>',

	APP2:
				'</script>' +
			'</head>' +
			'<body>' +
				'<div id="root"></div>' +
				'<script>bootstrap( );</script>' +
			'</body>' +
		'</html>',

	TST:

		'<!DOCTYPE html>' +
		'<html>' +
			'<head>' +
				'<meta charset="utf-8">' +
				'<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
				'<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">' +
				'<title>' +
					'[{(TITLE)}]' +
				'</title>' +
				'<style>' +
					'[{(STYLE)}]' +
				'</style>' +
				'<script src="' + PATH.APPLICATION + '/' + FILE.APP_JS + '"></script>' +
			'</head>' +
			'<body>' +
				'<div id="root"></div>' +
				'<script>bootstrap( );</script>' +
			'</body>' +
		'</html>',

	DEV:

		'<!DOCTYPE html>' +
		'<html>' +
			'<head>' +
				'<meta charset="utf-8">' +
				'<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
				'<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">' +
				'<title>' +
					'[{(TITLE)}]' +
				'</title>' +
				'<link rel="stylesheet" href="' + PATH.STYLESHEETS.ROOT + PATH.STYLESHEETS.CSS +'/zz.css"></style>' +
				'<link rel="stylesheet" href="' + PATH.STYLESHEETS.ROOT + PATH.STYLESHEETS.GSS +'/zz.css"></style>' +
				'<script src="' + PATH.GOOG.ROOT + '/closure/goog/base.js"></script>' +
				'<script>goog.require("goog.soy");</script>' +
				'<script src="' + PATH.SOURCES.ROOT + PATH.SOURCES.TEMPLATE + '/soyutils_usegoog.js"></script>' +
				'<script src="' + PATH.SOURCES.ROOT + '/deps.js"></script>' +
				'<script src="' + PATH.SOURCES.ROOT + '/base.js"></script>' +
			'</head>' +
			'<body>' +
				'<div id="root"></div>' +
				'<script>bootstrap( );</script>' +
			'</body>' +
		'</html>'
};

/**********************************************************************************************************************
 * Exports                                                                                                            *
 **********************************************************************************************************************/

module.exports = {

	IS_WINDOWS: IS_WINDOWS,
	DEFAULTS: DEFAULTS,
	PATH: PATH,
	FILE: FILE,
	TOOLS: TOOLS,
	TEMPLATE: TEMPLATE
};