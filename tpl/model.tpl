goog.provide( '[{(NAMESPACE)}]' );
goog.provide( '[{(NAMESPACE)}]Datarow' );

goog.require( 'zz.models.Datarow' );
goog.require( 'zz.models.Dataset' );
goog.require( 'zz.models.enums.FieldType' );

[{(REQUIRELOOP)}]

/**
* @param {!zz.models.Dataset} dataset
* @param {?Array.<string>} opt_data
* @extends {zz.models.Datarow}
* @constructor
*/
[{(NAMESPACE)}]Datarow = function( dataset, opt_data ){

[{(FIELDSDEFINE)}]

/**
* Call parent constructor.
*/
zz.models.Datarow.call( this, dataset, opt_data );
};

goog.inherits( [{(NAMESPACE)}]Datarow, zz.models.Datarow );

/**
* @param {goog.event.EventTarget=} opt_parent
* @param {Array.<Array>=} opt_data
* @extends {zz.models.Dataset}
* @constructor
*/
[{(NAMESPACE)}] = function( opt_parent, opt_data ){

zz.models.Dataset.call( this, opt_parent, opt_data );
};
goog.inherits( [{(NAMESPACE)}], zz.models.Dataset );

/**
* Current dataset row type.
* @constructor
* @overwrite
* @type {[{(NAMESPACE)}]Datarow}
*/
[{(NAMESPACE)}].prototype.DatarowConstructor = [{(NAMESPACE)}]Datarow;

/**
* Return [{(NAMESPACE)}]Datarow schema object.
* @override
* @returns {Object}
*/
[{(NAMESPACE)}].prototype.getDatarowSchema = function( ){

return [{(FIELDS)}];
};