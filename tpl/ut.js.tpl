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
 */

goog.provide( '[{(NAMESPACE)}].TestRunner' );
goog.setTestOnly( '[{(NAMESPACE)}].TestRunner' );




/**
* Test on existence of members
* @param {Array.<string>} members
* @param {*} subjToTest
*/
[{(NAMESPACE)}].TestRunner.checkMembers = function ( members, subjToTest, opt_titleErrMessage ){

    opt_titleErrMessage = opt_titleErrMessage? ( opt_titleErrMessage + '\n' ): '';

    var errors = '';
    goog.array.forEach( members, function( member ){

        if( !goog.object.containsKey( subjToTest, member ) ){

            errors += 'Must have ' + member + '\n';
        }
    } );

    assertTrue(

        ( opt_titleErrMessage + errors ),
        errors === ''
    );
}