/* globals $ */
/* eslint-env node, dirigible */

var database = require('db/database');
var datasource = database.getDatasource();
var applicationsDaoExtensionsUtils = require('zeus/landscapes/utils/applicationsDaoExtensionUtils');

// Create an entity
exports.create = function(entity) {
    var connection = datasource.getConnection();
    try {
        var sql = 'INSERT INTO ZEUS_APPLICATIONS (APPLICATION_ID,APPLICATION_NAME,APPLICATION_TEMPLATE_ID) VALUES (?,?,?)';
        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = datasource.getSequence('ZEUS_APPLICATIONS_APPLICATION_ID').next();
        statement.setInt(++i, id);
        statement.setString(++i, entity.application_name);
        statement.setInt(++i, entity.application_template_id);
		applicationsDaoExtensionsUtils.beforeCreate(connection, entity);
        statement.executeUpdate();
        applicationsDaoExtensionsUtils.afterCreate(connection, entity);
    	return id;
    } finally {
        connection.close();
    }
};

// Return a single entity by Id
exports.get = function(id) {
	var entity = null;
    var connection = datasource.getConnection();
    try {
        var sql = 'SELECT * FROM ZEUS_APPLICATIONS WHERE APPLICATION_ID = ?';
        var statement = connection.prepareStatement(sql);
        statement.setInt(1, id);

        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
            entity = createEntity(resultSet);
        }
    } finally {
        connection.close();
    }
    return entity;
};

// Return a single entity by name
exports.getByName = function(name) {
	var entity = null;
    var connection = datasource.getConnection();
    try {
        var sql = 'SELECT * FROM ZEUS_APPLICATIONS WHERE APPLICATION_NAME = ?';
        var statement = connection.prepareStatement(sql);
        statement.setString(1, name);

        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
            entity = createEntity(resultSet);
        }
    } finally {
        connection.close();
    }
    return entity;
};

// Return all entities
exports.list = function(limit, offset, sort, desc) {
    var result = [];
    var connection = datasource.getConnection();
    try {
        var sql = 'SELECT ';
        if (limit !== null && offset !== null) {
            sql += ' ' + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += ' * FROM ZEUS_APPLICATIONS';
        if (sort !== null) {
            sql += ' ORDER BY ' + sort;
        }
        if (sort !== null && desc !== null) {
            sql += ' DESC ';
        }
        if (limit !== null && offset !== null) {
            sql += ' ' + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
    } finally {
        connection.close();
    }
    return result;
};

// Update an entity by Id
exports.update = function(entity) {
    var connection = datasource.getConnection();
    try {
        var sql = 'UPDATE ZEUS_APPLICATIONS SET   APPLICATION_NAME = ?, APPLICATION_TEMPLATE_ID = ? WHERE APPLICATION_ID = ?';
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, entity.application_name);
        statement.setInt(++i, entity.application_template_id);
        statement.setInt(++i, entity.application_id);
		applicationsDaoExtensionsUtils.beforeUpdate(connection, entity);
        statement.executeUpdate();
        applicationsDaoExtensionsUtils.afterUpdate(connection, entity);
    } finally {
        connection.close();
    }
};

// Delete an entity
exports.delete = function(entity) {
    var connection = datasource.getConnection();
    try {
    	var sql = 'DELETE FROM ZEUS_APPLICATIONS WHERE APPLICATION_ID = ?';
        var statement = connection.prepareStatement(sql);
        statement.setString(1, entity.application_id);
        applicationsDaoExtensionsUtils.beforeDelete(connection, entity);
        statement.executeUpdate();
        applicationsDaoExtensionsUtils.afterDelete(connection, entity);
    } finally {
        connection.close();
    }
};

// Return the entities count
exports.count = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM ZEUS_APPLICATIONS';
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } finally {
        connection.close();
    }
    return count;
};

// Returns the metadata for the entity
exports.metadata = function() {
	var metadata = {
		name: 'zeus_applications',
		type: 'object',
		properties: [
		{
			name: 'application_id',
			type: 'integer',
			key: 'true',
			required: 'true'
		},
		{
			name: 'application_name',
			type: 'string'
		},
		{
			name: 'application_template_id',
			type: 'integer'
		},
		]
	};
	return metadata;
};

// Create an entity as JSON object from ResultSet current Row
function createEntity(resultSet) {
    var result = {};
	result.application_id = resultSet.getInt('APPLICATION_ID');
    result.application_name = resultSet.getString('APPLICATION_NAME');
	result.application_template_id = resultSet.getInt('APPLICATION_TEMPLATE_ID');
    return result;
}

