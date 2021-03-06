﻿/*
	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var FP =
{
	Version: '1.1.9',
	Data: {},
	Module: {},
	querystring: [],
	queryObject: {},
	styles: {},
	
	moduleCategories: {
		Forum: 'Forum',
		Presentation: 'Presentation',
		Tweaks: 'Tweaks'
	},
	
	development: false,
	
	init: function(queryString, queryObject)
	{
		if (typeof(chrome) == 'object')
		{
			this.Browser	= 'chrome';
			this.ExtDir		= chrome.extension.getURL('data') + '/';
		}
		else
		{
			this.Browser	= 'firefox';
			//this.ExtDir		= 'resource://jid1-wBQ459dI4EwqHg-at-jetpack-fidplus-data/';
			
			self.on('message', function(message)
			{
				if (message.type == 'getDir')
				{
					FP.ExtDir = message.dir;
				}
			});
			
			self.postMessage('getDir');
		}
		
		this.querystring = queryString;
		this.queryObject = queryObject;
	},
	
	chromeContext: function()
	{
		if (FP.Browser == 'chrome')
		{
			try
			{
				if (window.location.protocol == 'chrome-extension:')
				{
					return 'background';
				}
				else
				{
					return 'content';
				}
			}
			catch (e)
			{
				return 'content';
			}
		}
	},
	
	addStyleSheet: function(file)
	{
		if (typeof this.styles[file] != 'undefined')
		{
			var holder = $('style#fidplusCss');
			
			if (holder.length == 0)
			{
				holder = $('<style>').attr('id', 'fidplusCss');
				$('head').append(holder);
			}
			
			holder.append(this.styles[file].replace(/{extdir}/g, this.ExtDir));
		}
	},
	
	domChange: function(event)
	{
		var	
			doc = event.target.ownerDocument,
			content = FP.isFid() ? doc.getElementById('aspnetForm') : doc.getElementsByTagName('body')[0];
		
		// Remove the event listener
		content.removeEventListener('DOMSubtreeModified', FP.domChange, false);
		
		for (var module in changes)
		{
			changes[module].change();
		}
		
		// Re-add the event listener
		content.addEventListener('DOMSubtreeModified', FP.domChange, false);
	},
	
	getId: function(string)
	{
		return string.match(/id=([0-9]+)/)[1];
	},
	
	isFid: function()
	{
		return $('.settings-menu').length == 1;
	},
	
	isForum: function()
	{
		return this.currUrl.indexOf('forum') != -1;
	},
	
	isPage: function(page)
	{
		if (page.constructor == Array)
		{
			var pages = [];
			
			$.each(page, function(key, val)
			{
				pages.push(FP.fidPages[val]);
			});
			
			return $.inArray(this.pathname, pages) != -1;
		}
		
		return this.pathname == this.fidPages[page];
	},
	
	isOwnComp: function()
	{
		return this.isPage(['compOwnAwards', 'compOwnFixtures', 'compOwnPress', 'compOwnTable']);
	},
	
	log: function(message)
	{
		if (this.development)
		{
			console.log(message);
		}
	},
	
	playSound: function(sound)
	{
		if (FP.Browser == 'chrome')
		{
			var music = new Audio(this.ExtDir + 'resources/sounds/' + sound);
			music.play();
		}
		else
		{
			var audio = $('<audio>').attr('autoplay', 'autoplay').append(
				$('<source>').attr({src: this.ExtDir + 'resources/sounds/' + sound, type: 'audio/mpeg'})
			);
			
			$('body').prepend(audio);
		}
	},
	
	registerStyle: function(name, content)
	{
		this.styles[name] = content;
	},
	
	sendMessage: function(data, callback)
	{
		if (typeof callback != 'function')
		{
			callback = function(){};
		}
		
		if (FP.Browser == 'chrome')
		{
			chrome.extension.sendRequest(data, callback);
		}
		else
		{
			data.responseKey = Math.random().toString(36).substr(2, 5);
			
			self.postMessage(data);
			
			self.on('message', function(msg)
			{
				if (msg.responseKey == data.responseKey)
				{
					callback();
				}
			})
		}
	}
};