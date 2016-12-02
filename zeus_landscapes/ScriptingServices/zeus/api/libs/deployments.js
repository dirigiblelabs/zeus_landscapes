/* globals $ */
/* eslint-env node, dirigible */

var httpClient = require('net/http/client');
var generator = require('platform/generator');

exports.list = function(host, token, namespace) {
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/deployments', {
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
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}', {
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

exports.create = function(host, token, namespace, name, replicas, image, env) {
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/deployments', {
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
		'body': JSON.stringify(getDeploymentBody(namespace, name, replicas, image, env))
	});

	return JSON.parse(httpResponse.data);
};

exports.delete = function(host, token, namespace, name) {
	var api = generator.generate('${host}/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}', {
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

function getDeploymentBody(namespace, application, replicas, image, env) {
	return {
	    "kind": "Deployment",
	    "apiVersion": "extensions/v1beta1",
	    "metadata": {
	        "name": application,
	        "namespace": namespace,
	        "labels": {
	            "application": application
	        }
	    },
	    "spec": {
	        "replicas": replicas,
	        "selector": {
	            "matchLabels": {
	                "application": application
	            }
	        },
	        "template": {
	            "metadata": {
	                "labels": {
	                    "application": application
	                }
	            },
	            "spec": {
	                "containers": [
	                    {
	                        "name": application,
	                        "image": image,
	                        "ports": [
	                            {
	                                "containerPort": 8080,
	                                "protocol": "TCP"
	                            }
	                        ],
	                        "resources": {
	                        	"requests": {
	                        		"cpu": "200m"
	                        	}
	                        },
	                    	"env": env
	                    }
	                ]
	            }
	        }
	    }
	};
}
