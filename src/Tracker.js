/*!
 * Tracker: Core of SAA1099Tracker.
 * Copyright (c) 2013-2015 Martin Borik <mborik@users.sourceforge.net>
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
$(document).ready(function () { window.Tracker = new Tracker });
//---------------------------------------------------------------------------------------
var TracklistPosition = (function () {
	function TracklistPosition() {
		this.y = 0;
		this.line = 0;
		this.channel = 0;
		this.column = 0;
		this.start = { x: 0, y: 0 };
		this.compare = function (p) {
			return (this.y === p.y &&
					this.line === p.line &&
					this.channel === p.channel &&
					this.column === p.column);
		}
	}

	return TracklistPosition;
})();
//---------------------------------------------------------------------------------------
var Tracker = (function() {
	function Tracker() {
		this.modePlay = false;
		this.modeEdit = false;
		this.modeEditChannel = 0;
		this.modeEditColumn = 0;
		this.workingPattern = 0;
		this.workingSample = 1;
		this.workingSampleTone = 36;
		this.workingOrnament = 1;

		this.ctrlOctave = 2;
		this.ctrlSample = 0;
		this.ctrlOrnament = 0;
		this.ctrlRowStep = 0;

		this.songTitle = '';
		this.songAuthor = '';

		this.selectionPoint = new TracklistPosition;
		this.selectionStarted = false;
		this.selectionChannel = 0;
		this.selectionLine = 0;
		this.selectionLen = 0;

		this.settings = {
			tracklistLines: 17,
			tracklistLineHeight: 9,
			hexTracklines: true,
			hexSampleFreq: false,
			audioInterrupt: 50,
			audioBuffers: 0
		};

		this.pixelfont = { obj: null, ctx: null };
		this.tracklist = { obj: null, ctx: null };
		this.smpedit   = { obj: null, ctx: null };
		this.ornedit   = { obj: null, ctx: null };


	// constructor {
		this.player = new Player(new SAASound(AudioDriver.sampleRate));

		AudioDriver.setAudioSource(this.player);
		AudioDriver.play();

		this.populateGUI();
		this.updatePanels();

		var app = this;
		SyncTimer.start(function() {
			if (app.modePlay && app.player.changedLine) {
				if (app.player.changedPosition)
					app.updatePanelPosition();
				app.updatePanelInfo();
				app.updateTracklist();

				app.player.changedPosition = false;
				app.player.changedLine = false;
			}
		}, 20);
	// }
	}

	Tracker.prototype.loadDemosong = function (name) {
		var tracker = this;
		var player = this.player;
		var settings = this.settings;

		$.getJSON('demosongs/' + name + '.json', function(data) {
			player.clearOrnaments();
			player.clearSamples();
			player.clearSong();

			tracker.songTitle = data.title;
			tracker.songAuthor = data.author;

			var a, c, d, i, j, k, o, p, q, s;
			for (i = 0; i < 32; i++) {
				if (a = data.samples[i]) {
					s = player.sample[i];
					s.name = a.name;
					s.loop = a.loop;
					s.end = a.end;
					s.releasable = !!a.rel;
					for (j = 0, k = 0, d = atob(a.data); j < d.length; j += 3, k++) {
						c = (d.charCodeAt(j + 1) & 0xff);
						s.data[k].volume.byte = (d.charCodeAt(j) & 0xff);
						s.data[k].enable_freq = !!(c & 0x80);
						s.data[k].enable_noise = !!(c & 0x40);
						s.data[k].noise_value = (c & 0x30) >> 4;
						s.data[k].shift = (c & 7) | (d.charCodeAt(j + 2) & 0xff);
						if (!!(c & 8))
							s.data[k].shift *= -1;
					}
				}
			}

			for (i = 0; i < 16; i++) {
				if (a = data.ornaments[i]) {
					o = player.ornament[i];
					o.name = a.name;
					o.loop = a.loop;
					o.end = a.end;
					for (j = 0, d = atob(a.data); j < d.length; j++)
						o.data[j] = d.charCodeAt(j);
				}
			}

			for (i = 0; i < data.patterns.length; i++) {
				if (!!(d = data.patterns[i])) {
					d = atob(d);
					p = player.pattern[player.addNewPattern()];
					p.end = (d.charCodeAt(0) & 0xff);
					for (j = 1, k = 0; j < d.length; j += 5, k++) {
						p.data[k].tone = (d.charCodeAt(j) & 0x7f);
						p.data[k].release = !!(d.charCodeAt(j) & 0x80);
						p.data[k].smp = (d.charCodeAt(j + 1) & 0x1f);
						p.data[k].orn_release = !!(d.charCodeAt(j + 1) & 0x80);
						p.data[k].volume.byte = (d.charCodeAt(j + 2) & 0xff);
						p.data[k].orn = (d.charCodeAt(j + 3) & 0x0f);
						p.data[k].cmd = (d.charCodeAt(j + 3) & 0xf0) >> 4;
						p.data[k].cmd_data = (d.charCodeAt(j + 4) & 0xff);
					}
				}
			}

			for (i = 0; i < data.positions.length; i++) {
				a = data.positions[i];
				d = atob(a.ch);
				q = player.position[i] = new pPosition(a.length, a.speed);
				for (j = 0, k = 0; j < 6; j++) {
					q.ch[j].pattern = (d.charCodeAt(k++) & 0xff);
					q.ch[j].pitch = d.charCodeAt(k++);
				}
			}

			player.setInterrupt((settings.audioInterrupt = data.config.audioInterrupt));
			player.currentPosition = data.config.currentPosition;
			player.repeatPosition = data.config.repeatPosition;
			player.currentLine = data.config.currentLine;
			tracker.modeEditChannel = data.config.editChannel;
			tracker.ctrlOctave = data.config.ctrlOctave;
			tracker.ctrlSample = data.config.ctrlSample;
			tracker.ctrlOrnament = data.config.ctrlOrnament;
			tracker.ctrlRowStep = data.config.ctrlRowStep;

			tracker.updatePanels();
			tracker.updateTracklist();
		});
	};

	return Tracker;
})();
//---------------------------------------------------------------------------------------
