/* globals $ */
/* eslint-env node, dirigible */

var httpClient = require('net/http/client');
var generator = require('platform/generator');

exports.list = function(host, token, namespace) {
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/replicasets', {
		'host': host,
		'namespace': namespace
	});

	var httpResponse = httpClient.get(api, {
		'headers': [{
			'name': 'Authorization',
			'value': 'Bearer ' + token
		}]
	});

	var data = httpResponse.data;
	return data ? JSON.parse(data).items : [];
};

exports.delete = function(host, token, namespace, name) {
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/replicasets/${name}', {
		'host': host,
		'namespace': namespace,
		'name': name
	});

	var httpResponse = httpClient.delete(api, {
		'headers': [{
			'name': 'Authorization',
			'value': 'Bearer ' + token
		}], 
	});

	return JSON.parse(httpResponse.data);
};