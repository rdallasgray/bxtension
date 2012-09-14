/*

  Copyright (c) 2009 Robert Johnston

  This file is part of Bxtension.

  Bxtension is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
  
  Bxtension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with Bxtension. If not, see http://www.gnu.org/licenses/.

*/

Bxt.Controller.Uploads = {

	  uploadList: {},

	  getQueued: function() {
		    var list = Bxt.Controller.Uploads.uploadList,
        queued = [list[i] for (i in list) if (list[i].state === "queued")];
        Bxt.log(queued);
        return queued;
	  },

	  getActive: function() {
		    var list = Bxt.Controller.Uploads.uploadList;
		    return [list[i] for (i in list) if (list[i].state === "active")];
	  },

	  getDone: function() {
		    var list = Bxt.Controller.Uploads.uploadList;
		    return [list[i] for (i in list) if ((list[i].state === "cancelled") || (list[i].state === "succeeded") || (list[i].state === "failed"))];
	  },
	  
	  getUploadById: function(id) {
		    return Bxt.Controller.Uploads.uploadList[id];
	  },

	  processQueue: function() {
		    if (Bxt.Controller.Uploads.getActive().length < 3) {
			      if (Bxt.Controller.Uploads.getQueued().length > 0) {
				        Bxt.Controller.Uploads.getQueued()[0].start();
			      }
		    }
	  },
	  
	  sendWindowEvent: function(eventType,options) {
		    if (Bxt.Controller.Uploads.window !== undefined && Bxt.Controller.Uploads.window.document !== null) {
			      var e = Bxt.Controller.Uploads.window.document.createEvent("CustomEvent");
			      e.initCustomEvent(eventType, true, false, options);
			      Bxt.Controller.Uploads.window.dispatchEvent(e);
		    }
	  },
	  
	  addUpload: function(req,file) {
		    
		    if (Bxt.Controller.Uploads.window === undefined || Bxt.Controller.Uploads.window.closed) {
			      Bxt.Controller.Uploads.showWindow(function() {
                Bxt.log("Booting upload window.");
				        Bxt.Controller.Uploads.window.document.getElementById("bxt-upload-box").boot(Bxt.Controller.Uploads);
			      });
		    }
		    
		    var u = new Bxt.Upload(req,file);
        Bxt.log("Added upload.");
		    Bxt.Controller.Uploads.processQueue();
	  },
	  
	  showWindow: function(callback) {
		    var callback = callback || function() { return true; };
		    Bxt.Controller.Uploads.window = window.openDialog(
			      "chrome://bxtension/content/bxt-window-uploads.xul",
			      "uploads",
			      "chrome=yes,width=400,height=240,status=yes,resizable=yes,scrollbars=yes",
			      callback
		    );
	  },
	  
	  clearList: function() {
		    var self = this;
		    this.getDone().forEach(function(upload) upload.remove());
	  }

};
