/*

Copyright (c) 2009 Robert Johnston

This file is part of Bxtension.

Bxtension is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Bxtension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Bxtension. If not, see http://www.gnu.org/licenses/.

*/

Bxt.Services = {

	handleRequest: function(e) {
		Bxt.console.logStringMessage("serviceRequest: "+e.target.wrappedJSObject.serviceRequest.toSource());
		Bxt.Services.public[e.target.wrappedJSObject.serviceRequest.service](e.target.wrappedJSObject);
	},

	notifyComplete: function(requester) {
		var ev = requester.ownerDocument.createEvent("Events");
		ev.initEvent("ServiceResponse", true, false);
		requester.dispatchEvent(ev);
	},
		
	createRequest: function(options) {

		var knock = function() {
			req.tries++;
		
			if (req.tries > 4) {
				req.xhr.removeEventListener("load", knock, false, true);
				Bxt.console.logStringMessage(req.options.url+": knocked four times, running callback anyway");
				req.callback();
				return;
			}
			if (req.xhr.status === 401) {
				Bxt.console.logStringMessage(req.options.url+": knocked and got 401, trying again");
				req.xhr.removeEventListener("load", knock, false, true);
				req.xhr.abort();
				req.setup();
				req.send();
			}
			else {
				Bxt.console.logStringMessage(req.options.url+": knocked and status was "+req.xhr.status+", running callback");
				req.xhr.removeEventListener("load", knock, false, true);
				Bxt.console.logStringMessage(req.xhr.responseText);
				req.callback();
			}
		}

		var req = {
			
			options: options,
			data: null,
			binary: false,
			callback: function() { return true; },
			headers: {},
			handlers: [],
			
			addHeader: function(name,value) {
				req.headers[name] = value;
			},
			
			addHandler: function(event,callback,upload) {
				var upload = upload || false;
				req.handlers.push({ event: event, callback: callback, upload: upload });
			},
			
			setHeaders: function() {
				for (var i in req.headers) {
					req.xhr.setRequestHeader(i,req.headers[i]);
				}
			},
			
			setHandlers: function() {
				req.handlers.forEach(function(h) {
					var obj = h.upload ? req.xhr.upload : req.xhr;
					obj.addEventListener(h.event,h.callback,false,true)
				});
			},
			
			xhr: Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest),
			
			setup: function() {
				req.xhr.addEventListener("load", knock, false, true);
				req.setHandlers();
			},
			
			send: function(data) {
				var data = data || req.data;
				req.setup();
				req.xhr.open(req.options.method,req.options.url,true,req.options.username,req.options.password);
				req.setHeaders();
				var sendFunc = (req.binary === true) ? "sendAsBinary" : "send";
				req.xhr[sendFunc](data);
			},
			
			reset: function() {
				req.tries = 0;
			},
			
			tries: 0
		}
		
		req.xhr.withCredentials = true;
		req.xhr.mozBackgroundRequest = true;

		return req;
	},

	public: {

		authenticatedRequest: function(requester) {

			var req = Bxt.Services.createRequest(requester.serviceRequest.options);

			req.addHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
			
			if (requester.serviceRequest.options.headers !== undefined) {
				for (var h in requester.serviceRequest.options.headers) {
					req.addHeader(h,requester.serviceRequest.options.headers[h]);
				}
			}

			req.callback = 	function() {
				requester.response = { 
					text: req.xhr.responseText,
					status: req.xhr.status
				};
				Bxt.Services.notifyComplete(requester);
			}
			
			req.data = requester.serviceRequest.data;
			req.send();
		},

		fileUpload: function(requester) {

			var file = Bxt.Controller.Files.pick(requester.serviceRequest.options.contentType);

			if (file !== false) {

				var req = Bxt.Services.createRequest(requester.serviceRequest.options);
				req.binary = true;
				
				Bxt.console.logStringMessage(req.options.toSource());

				req.callback = 	function() {
					requester.response = { 
						text: req.xhr.responseText,
						status: req.xhr.status
					};
					Bxt.Services.notifyComplete(requester);
				}

				Bxt.Controller.Uploads.addUpload(req,file);
			}
		},
		
		clearHttpAuth: function(requester) {
			var auth = Components.classes["@mozilla.org/network/http-auth-manager;1"].getService(Components.interfaces.nsIHttpAuthManager);
			auth.clearAll();
			requester.response = { status: "OK" };
			Bxt.Services.notifyComplete(requester);
		}
	}

}