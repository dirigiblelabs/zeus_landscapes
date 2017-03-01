/* globals $ */
/* eslint-env node, dirigible */

var applicationsDao = require('zeus/landscapes/dao/applicationsDao');

exports.afterCreateApplication = function(application) {
	applicationsDao.create({
		'application_name': application.name,
		'application_template_id': application.applicationTemplateId
	});
};

exports.afterDeleteApplication = function(applicationName) {
	var application = applicationsDao.getByName(applicationName);
	if (application) {
		applicationsDao.delete(application);
	}
};
