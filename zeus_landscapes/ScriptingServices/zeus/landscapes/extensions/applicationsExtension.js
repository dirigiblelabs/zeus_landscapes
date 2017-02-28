/*
	Extension for the '/zeus/landscapes/applications_database_crud_hooks' Extension Point!

	The extension point allows having an extension implementation for the following functions:
		- beforeCreate(connection, entity);
		- afterCreate(connection, entity);
		- beforeUpdate(connection, entity);
		- afterUpdate(connection, entity);
		- beforeDelete(connection, entity);
		- afterDelete(connection, entity);

	It is not required to have extension implementation for all functions.
	For example the extension can provide an implementation only for the 'afterCreate(connection, entity);' function.
*/

/* globals $ */
/* eslint-env node, dirigible */

exports.beforeCreate = function(connection, entity) {
	console.log('Before creating new entity \'' + entity + '\' in table \'ZEUS_APPLICATIONS\'');
};

exports.afterCreate = function(connection, entity) {
	console.log('After creating new entity \'' + entity + '\' in table \'ZEUS_APPLICATIONS\'');
};

exports.beforeUpdate = function(connection, entity) {
	console.log('Before updating table \'ZEUS_APPLICATIONS\' with entity \'' + entity + '\'');
};

exports.afterUpdate = function(connection, entity) {
	console.log('After updating table \'ZEUS_APPLICATIONS\' with entity \'' + entity + '\'');
};

exports.beforeDelete = function(connection, entity) {
	console.log('Before deleting entity \'' + entity + '\' from table \'ZEUS_APPLICATIONS\'');
};

exports.afterDelete = function(connection, entity) {
	console.log('After deleting entity \'' + entity + '\' from table \'ZEUS_APPLICATIONS\'');
};
