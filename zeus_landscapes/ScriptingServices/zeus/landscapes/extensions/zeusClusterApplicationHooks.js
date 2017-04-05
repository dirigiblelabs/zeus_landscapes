/* globals $ */
/* eslint-env node, dirigible */

var applicationsDao = require('zeus/landscapes/dao/applicationsDao');
var devInstancesDao = require('zeus/code/dao/devInstancesDao');

exports.afterCreateApplication = function(application) {
	applicationsDao.create({
		'application_name': application.name,
		'application_template_id': application.applicationTemplateId
	});

	if (application.url && application.isDevInstance) {
		devInstancesDao.create({
			'application_name': application.name,
			'url': application.url
		});
	}
};

exports.afterDeleteApplication = function(applicationName) {
	var application = applicationsDao.getByName(applicationName);
	if (application) {
		applicationsDao.delete(application);
	}

	var devInstance = devInstancesDao.getByName(applicationName);
	if (devInstance) {
		devInstancesDao.delete(devInstance);
	}
};
