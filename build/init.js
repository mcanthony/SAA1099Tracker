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
!function(){var a,b,c,d,e=/\/[a-z]+?\.js(\?.*)?$/,f=window.location,g=(f.search||f.hash).match(/[\?&#]dev/)?"":".min",h=document.getElementsByTagName("script")[0],i=["jquery","bootstrap","Commons","Audio","Player","SAASound","Tracker"];for(d=h&&h.src.match(e)?h.src.replace(e,"/js/").replace(f.href,""):"js/",h=document.getElementsByTagName("head")[0],a=0,b=i.length;b>a;a++){e=d+i[a]+g+".js";try{document.write('<script type="text/javascript" src="'+e+'"></script>')}catch(a){c=document.createElement("script"),c.setAttribute("type","text/javascript"),c.setAttribute("src",e),h.appendChild(c)}}window.dev=!g}();