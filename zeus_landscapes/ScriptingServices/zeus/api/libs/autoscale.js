/* globals $ */
/* eslint-env node, dirigible */

var httpClient = require('net/http/client');
var generator = require('platform/generator');

exports.create = function(host, token, namespace, name, minReplicas, maxReplicas, targetCPUUtilizationPercentage) {
	var api = generator.generate('${host}/apis/autoscaling/v1/namespaces/${namespace}/horizontalpodautoscalers', {
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
		'body': JSON.stringify(getAutoScaleBody(namespace, name, minReplicas, maxReplicas, targetCPUUtilizationPercentage))
	});

	return JSON.parse(httpResponse.data);
};

exports.delete = function(host, token, namespace, name) {
	var api = generator.generate('${host}/apis/autoscaling/v1/namespaces/${namespace}/horizontalpodautoscalers/${name}', {
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

function getAutoScaleBody(namespace, name, minReplicas, maxReplicas, targetCPUUtilizationPercentage) {
	return {
		'metadata': {
			'name': name,
			'namespace': namespace	
		},
		'spec': {
			'scaleTargetRef': {
				'kind': 'Deployment',
				'name': name
			},
			'minReplicas': minReplicas,
			'maxReplicas': maxReplicas,
			'targetCPUUtilizationPercentage': targetCPUUtilizationPercentage
		}
	};
}
