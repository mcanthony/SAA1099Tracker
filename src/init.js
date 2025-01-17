/*!
 * SAA1099Tracker
 * Copyright (c) 2012-2015 Martin Borik <mborik@users.sourceforge.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
 * OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
//---------------------------------------------------------------------------------------
(function() {
	var i, l, s,
		js = /\/[a-z]+?\.js(\?.*)?$/, path, loc = window.location,
		dev = (loc.search || loc.hash).match(/[\?&#]dev/) ? '' : '.min',
		el = document.getElementsByTagName('script')[0],
		libs = [
			'jquery',
			'bootstrap',
			'Commons',
			'Audio',
			'Player',
			'SAASound',
			'Tracker'
		];

	if (el && el.src.match(js))
		path = el.src.replace(js, '/js/').replace(loc.href, '');
	else
		path = 'js/';

	el = document.getElementsByTagName('head')[0];
	for (i = 0, l = libs.length; i < l; i++) {
		js = path + libs[i] + dev + '.js';
		try {
			document.write('<' + 'script type="text/javascript" src="' + js + '"><\/script>');
		} catch (e) {
			s = document.createElement('script');
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', js);
			el.appendChild(s);
		}
	}

	window.dev = !dev;
})();
