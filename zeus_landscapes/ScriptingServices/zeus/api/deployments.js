/* globals $ */
/* eslint-env node, dirigible */

var request = require('net/http/request');
var response = require('net/http/response');
var xss = require('utils/xss');
var deploymentsLib = require('zeus/api/libs/deployments');

var HOST = 'https://192.168.99.100:8443';

var TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldG'
	+ 'VzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9u'
	+ 'YW1lc3BhY2UiOiJkZXYtYWNjb3VudCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY29'
	+ '1bnQvc2VjcmV0Lm5hbWUiOiJkZWZhdWx0LXRva2VuLTNzaWtnIiwia3ViZXJuZXRlcy'
	+ '5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImRlZmF1bHQiLC'
	+ 'JrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI'
	+ 'xNDE0ODE0NC1iNjIzLTExZTYtOGNjOS1iYTRhYTZjNDJlNWIiLCJzdWIiOiJzeXN0ZW06'
	+ 'c2VydmljZWFjY291bnQ6ZGV2LWFjY291bnQ6ZGVmYXVsdCJ9.hWF_Lb7JXcNh_xtS_UOio'
	+ 'J0h_5QOSLglOm6aDHIrijJcrfvF9ABdBF99J84KGWcHJlaXLGorV_v6ooQ2jdE8E3xwLk1F0'
	+ 'wGqmlETRYf9ylp4Twg905j6FkUvKIGIXY-_LyT-XEF4RasQyYJYuXAQjWQ1ysrAJdE6hUWLk'
	+ 'UceZ0EZX8ImpE4e_-fBaYqoTGAlQsEp8skixJQp_o0XQRD6BB9dHJ9-drchEOs1sfntXga9Pl'
	+ 'tK0SNwdRStr9xfk3ZhJgByaf34KrFwCQr2UvIVHhHmAVtVJmo-25hZq0i9Xs-fynCEhOAf4h2'
	+ 'Gux-qeKaBzuD8u-iZuy8YZASBBEjl8g';

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
		var status = deployment.code ? deployment.code : httpResponse.OK;
		sendResponse(httpResponse, status, 'application/json', JSON.stringify(deployment));
	} else if (namespace) {
		var deployments = deploymentsLib.list(HOST, TOKEN, namespace);
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
	var namespace = xss.escapeSql(httpRequest.getParameter('namespace'));

	var body = getRequestBody(httpRequest);
	var name = body.name;
	var replicas = body.replicas;
	var image = body.image;
	var env = body.env;

	// TODO Add validation!
	var deployment = deploymentsLib.create(HOST, TOKEN, namespace, name, replicas, image, env);

	var status = deployment.code ? deployment.code : httpResponse.OK;
	sendResponse(httpResponse, status, 'application/json', JSON.stringify(deployment));
}

function handlePutRequest(httpRequest, httpResponse) {
}

function handleDeleteRequest(httpRequest, httpResponse, xss) {
	var namespace = xss.escapeSql(httpRequest.getParameter('namespace'));
	var name = xss.escapeSql(httpRequest.getParameter('name'));

	if (namespace && name) {
		var deployment = deploymentsLib.delete(HOST, TOKEN, namespace, name);
		var status = deployment.code ? deployment.code : httpResponse.OK;
		sendResponse(httpResponse, status, 'application/json', JSON.stringify(deployment));
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
