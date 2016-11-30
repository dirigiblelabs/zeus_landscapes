/* globals $ */
/* eslint-env node, dirigible */

var httpClient = require('net/http/client');
var generator = require('platform/generator');

exports.list = function(host, token, namespace) {
	var api = generator.generate('${host}/api/v1/namespaces/${namespace}/services', {
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

exports.get = function(host, token, namespace, name) {
	var api = generator.generate('${host}/api/v1/namespaces/${namespace}/services/${name}', {
		'host': host,
		'namespace': namespace,
		'name': name
	});

	var httpResponse = httpClient.get(api,  {
		'headers': [{
			'name': 'Authorization',
			'value': 'Bearer ' + token
		}]
	});

	return JSON.parse(httpResponse.data);
};

exports.create = function(host, token, namespace, name) {
	var api = generator.generate('${host}/api/v1/namespaces/${namespace}/services', {
		'host': host,
		'namespace': namespace
	});

	var httpResponse = httpClient.post(api, {
		'headers': [{
			'name': 'Authorization',
			'value': 'Bearer ' + token
		}, {
			'name': 'Content-Type',
			'value': 'application/json'
		}], 
		'body': JSON.stringify(getServiceBody(name))
	});

	return JSON.parse(httpResponse.data);
};

exports.delete = function(host, token, namespace, name) {
	var api = generator.generate('${host}/api/v1/namespaces/${namespace}/services/${name}', {
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

function getServiceBody(name) {
	return {
	    "kind": "Service",
	    "apiVersion": "v1",
	    "metadata": {
	        "name": name
	    },
	    "spec": {
	        "selector": {
	            "application": name
	        },
	        "ports": [
	            {
	                "protocol": "TCP",
	                "port": 8080,
	        		"targetPort": 8080
	            }
	        ],
	        "type": "NodePort"
	    }
	};
}