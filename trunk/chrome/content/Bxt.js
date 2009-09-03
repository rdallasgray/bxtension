/*

Copyright (c) 2009 Robert Johnston

This file is part of Bxtension.

Bxtension is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software  Foundation, either version 3 of the License, or (at your option) any later version.
 
Bxtension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Bxtension. If not, see http://www.gnu.org/licenses/.

*/


Bxt = {
	
	version: "1.0.1",
	
	boot: function() {
		window.addEventListener("DOMContentLoaded",function(e) {
			if (e.target instanceof XULDocument && e.target.documentElement.id === "bxs-window-main") {
				e.target.documentElement.setAttribute("bxt-version",Bxt.version);
			}
		},false,true);
		document.addEventListener("ServiceRequest", function(e) { return Bxt.Services.handleRequest(e); }, false, true);
	}

};

Bxt.boot();