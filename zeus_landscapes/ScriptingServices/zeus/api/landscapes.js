/* globals $ */
/* eslint-env node, dirigible */

var request = require('net/http/request');
var response = require('net/http/response');
var xss = require('utils/xss');
var env = require('core/env');
var deploymentsLib = require('zeus/api/libs/deployments');
var servicesLib = require('zeus/api/libs/services');
var replicasetsLib = require('zeus/api/libs/replicasets');

var IP = env.get('zeus.landscapes.ip');
var HOST = env.get('zeus.landscapes.host');
var TOKEN = env.get('zeus.landscapes.token');

handleRequest(request, response, xss);

function handleRequest(httpRequest, httpResponse, xss) {
	try {
		dispatchRequest(httpRequest, httpResponse, xss);
	} catch (e) {
		console.error(e);
		sendResponse(httpResponse, httpResponse.BAD_REQUEST, 'text/plain', e);
	}
}

function dispatchRequest(httpRequest, httpResponse, xss) {
	response.setContentType('application/json; charset=UTF-8');
	response.setCharacterEncoding('UTF-8');

	switch (httpRequest.getMethod()) {
		case 'GET':
			handleGetRequest(httpRequest, httpResponse, xss);
			break;
		case 'POST': 
			handlePostRequest(httpRequest, httpResponse);
			break;
		case 'PUT':
			handlePutRequest(httpRequest, httpResponse);
			break;
		case 'DELETE':
			handleDeleteRequest(httpRequest, httpResponse, xss);
			break;
		default:
			handleNotAllowedRequest(httpResponse);
	}
}

function handleGetRequest(httpRequest, httpResponse, xss) {
	var namespace = xss.escapeSql(httpRequest.getParameter('namespace'));
	var name = xss.escapeSql(httpRequest.getParameter('name'));

	if (namespace && name) {
		var deployment = deploymentsLib.get(HOST, TOKEN, namespace, name);
		var service = servicesLib.get(HOST, TOKEN, namespace, name);
		if (service) {
			deployment.url = IP + ':' + service.spec.ports[0].nodePort;
		}

		var status = deployment.code ? deployment.code : httpResponse.OK;

		sendResponse(httpResponse, status, 'application/json', JSON.stringify(deployment));
	} else if (namespace) {
		var deployments = deploymentsLib.list(HOST, TOKEN, namespace);
		var services = servicesLib.list(HOST, TOKEN, namespace);
		for (var i = 0 ; i < services.length; i ++) {
			for (var j = 0 ; j < deployments.length; j ++) {
				if (services[i].metadata.name === deployments[j].metadata.name) {
					deployments[j].url = IP + ':' + services[i].spec.ports[0].nodePort;
				}
			}
		}
		sendResponse(httpResponse, httpResponse.OK, 'application/json', JSON.stringify(deployments));
	} else {
		sendResponse(httpResponse, httpResponse.BAD_REQUEST, 'application/json', JSON.stringify({
			'status': 'Failure',
			'message': 'Missing required query parameters',
			'reason': 'BadRequest',
			'code': httpResponse.BAD_REQUEST
		}));
	}
}

function handlePostRequest(httpRequest, httpResponse) {
	var entity = {};
	var namespace = xss.escapeSql(httpRequest.getParameter('namespace'));
	var body = getRequestBody(httpRequest);
	var name = body.name;
	var replicas = body.replicas;
	var image = body.image;
	var envVars = body.env;

	// TODO Add validation!
	var deployment = deploymentsLib.create(HOST, TOKEN, namespace, name, replicas, image, envVars);
	entity.deployment = deployment;
	var status = deployment.code ? deployment.code : httpResponse.OK;

	if (status === httpResponse.OK) {
		var service = servicesLib.create(HOST, TOKEN, namespace, name);
		entity.service = service;
		status = service.code ? service.code : httpResponse.OK;
	}

	sendResponse(httpResponse, status, 'application/json', JSON.stringify(entity));
}

function handlePutRequest(httpRequest, httpResponse) {
}

function handleDeleteRequest(httpRequest, httpResponse, xss) {
	// TODO Delete Deployments + Delete ReplicaSet + Delete Service 
	var namespace = xss.escapeSql(httpRequest.getParameter('namespace'));
	var name = xss.escapeSql(httpRequest.getParameter('name'));

	if (namespace && name) {
		var entity = {};
		var deployment = deploymentsLib.delete(HOST, TOKEN, namespace, name);
		entity.deployment = deployment;
		var status = deployment.code ? deployment.code : httpResponse.OK;
		if (status === httpResponse.OK) {
			var service = servicesLib.delete(HOST, TOKEN, namespace, name);
			entity.service = service;
			status = service.code ? service.code : httpResponse.OK;
			var replicasets = replicasetsLib.list(HOST, TOKEN, namespace);
			for (var i = 0; i < replicasets.length; i ++) {
				if (replicasets[i].metadata.labels.application === name) {
					var replicaset = replicasetsLib.delete(HOST, TOKEN, namespace, replicasets[i].metadata.name);
					entity.replicaset = replicaset;
					if (status === httpResponse.OK) {
						status = replicaset.code ? replicaset.code : httpResponse.OK;
					}
				}
			}
		}
		sendResponse(httpResponse, status, 'application/json', JSON.stringify(entity));
	} else {
		sendResponse(httpResponse, httpResponse.BAD_REQUEST, 'application/json', JSON.stringify({
			'status': 'Failure',
			'message': 'Missing required query parameters',
			'reason': 'BadRequest',
			'code': httpResponse.BAD_REQUEST
		}));
	}
}

function handleNotAllowedRequest(httpResponse) {
	sendResponse(httpResponse, httpResponse.METHOD_NOT_ALLOWED);
}

function getRequestBody(httpRequest) {
	try {
		return JSON.parse(httpRequest.readInputText());
	} catch (e) {
		return null;
	}
}

function sendResponse(response, status, contentType, content) {
	response.setStatus(status);
	response.setContentType(contentType);
	response.println(content);
	response.flush();
	response.close();	
}
