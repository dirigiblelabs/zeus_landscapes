/* globals $ */
/* eslint-env node, dirigible */

const PATH = "/deployments";
const HTML_LINK = "../landscapes/index.html";

//exports.getMenuItem = function() {
//	return {  
//      "name": "Deployments",
//      "path": PATH,
//      "link": HTML_LINK
//   };
//};

exports.getSidebarItem = function() {
	return {  
      "name": "Deployments",
      "path": PATH,
      "link": HTML_LINK,
      "category": "Operate",
      "order": 404
   };
};
