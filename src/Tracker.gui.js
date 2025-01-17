/** Tracker.gui submodule - element populator with jQuery */
//---------------------------------------------------------------------------------------
Tracker.prototype.populateGUI = function () {
	var app = this, populatedElementsTable = [
		{
			global:   'document',
			method:   'bind',
			param:    'contextmenu',
			handler:  function(e) {
				e.preventDefault();
				return false;
			}
		}, {
			global:   'window',
			method:   'resize',
			handler:  function() {
				var c = app.tracklist.countTracklines();
				if (c !== app.settings.tracklistLineHeight) {
					app.tracklist.setHeight(c);
					app.updateTracklist(true);

					var offset = $('#statusbar').offset();
					$('#documodal .modal-body').css('height', offset.top * 0.8);
				}
			}
		}, {
			global:   'window',
			method:   'bind',
			param:    'keyup keydown',
			handler:  function(e) { return app.handleKeyEvent(e.originalEvent) }
		}, {
			global:   'window',
			method:   'bind',
			param:    'blur',
			handler:  function(e) {
				var i, o = app.globalKeyState;
				for (i in o) if ((i - 0)) {
					delete o[i];
					o.length--;
				}
			}
		}, {
			selector: '[data-tooltip]',
			method:   'each',
			handler:  function(i, el) {
				var data = (el.dataset || $(this).data()).tooltip || '',
					id = data.length ? data : el.id || el.htmlFor || el.name,
					delay = /^mi/.test(id) ? 500 : 2000,
					t = app.doc.tooltip[id];

				if (!t)
					return;

				$(this).tooltip({
					html: true,
					animation: false,
					delay: { "show": delay, "hide": 0 },
					placement: 'auto top',
					trigger: 'hover',
					title: t.replace(/\.{3}/g, '&hellip;')
					        .replace(/\n/g, '<br>')
					        .replace(/(\[.+?\])$/, '<kbd>$1</kbd>')
				});
			}
		}, {
			selector: 'canvas',
			method:   'each',
			handler:  function(i, el) {
				var name = el.className, o = app[name];

				if (name === 'tracklist') {
					o.obj = el;
					o.ctx = el.getContext('2d');
				}
				else if (name === 'smpornedit') {
					name = el.id.replace('smpedit_', '');

					o[name].obj = el;
					o[name].ctx = el.getContext('2d');
				}

				$(this).bind('mousedown mouseup mousemove dblclick mousewheel DOMMouseScroll', function (e) {
					var delta = e.originalEvent.wheelDelta || -e.originalEvent.deltaY || (e.originalEvent.type === 'DOMMouseScroll' && -e.originalEvent.detail);
					if (delta) {
						e.stopPropagation();
						e.preventDefault();

						e.delta = delta;
						e.type = 'mousewheel';
					}

					app.handleMouseEvent(name, o, e);
				});
			}
		}, {
			selector: 'img.pixelfont',
			method:   'load',
			handler:  function(e) { app.initPixelFont(e.target) }
		}, {
			selector: 'img.smpedit',
			method:   'load',
			handler:  function(e) { app.smpornedit.img = e.target }
		}, {
			selector: '#main-tabpanel a[data-toggle="tab"]',
			method:   'on',
			param:    'shown.bs.tab',
			handler:  function(e) { app.activeTab = parseInt($(this).data().value, 10) }
		}, {
			selector: '#scOctave',
			method:   'TouchSpin',
			data: {
				initval: '2',
				min: 1, max: 8
			}
		}, {
			selector: '#scOctave',
			method:   'change',
			handler:  function() { app.ctrlOctave = $(this).val() - 0 }
		}, {
			selector: '#scAutoSmp',
			method:   'TouchSpin',
			data: {
				initval: '0',
				radix: 32,
				min: 0, max: 31
			}
		}, {
			selector: '#scAutoSmp',
			method:   'change',
			handler:  function() { app.ctrlSample = parseInt($(this).val(), 32) }
		}, {
			selector: '#scAutoOrn',
			method:   'TouchSpin',
			data: {
				initval: '0',
				radix: 16,
				min: 0, max: 15
			}
		}, {
			selector: '#scAutoOrn',
			method:   'change',
			handler:  function() { app.ctrlOrnament = parseInt($(this).val(), 16) }
		}, {
			selector: '#scRowStep',
			method:   'TouchSpin',
			data: {
				initval: '0',
				min: 0, max: 8
			}
		}, {
			selector: '#scRowStep',
			method:   'change',
			handler:  function() { app.ctrlRowStep = $(this).val() - 0 }
		}, {
			selector: '#scPattern,#scPosCurrent,#scPosRepeat,input[id^="scChnPattern"]',
			method:   'TouchSpin',
			data: {
				initval: '0',
				min: 0, max: 0
			}
		}, {
			selector: '#scPatternLen,#scPosLength',
			method:   'TouchSpin',
			data: {
				initval: '64',
				min: 1, max: 96
			}
		}, {
			selector: '#scPattern',
			method:   'change',
			handler:  function() {
				if (app.player.pattern.length <= 1)
					return false;

				app.workingPattern = $(this).val() - 0;
				app.updatePanelPattern();
			}
		}, {
			selector: '#scPatternLen',
			method:   'change',
			handler:  function() {
				var pp = app.player.pattern[app.workingPattern];
				if (app.player.pattern.length <= 1)
					return false;
				else if (app.modePlay) {
					$(this).val(pp.end);
					return false;
				}

				pp.end = $(this).val() - 0;
				app.player.countPositionFrames();
				app.updatePanelPattern();
				app.updateTracklist();
				app.updatePanelInfo();
			}
		}, {
			selector: '#scPosCurrent',
			method:   'change',
			handler:  function() {
				if (!app.player.position.length)
					return false;
				else if (app.modePlay) {
					$(this).val(app.player.currentPosition + 1);
					return false;
				}

				app.player.currentPosition = $(this).val() - 1;
				app.player.currentLine = 0;

				app.updatePanelInfo();
				app.updatePanelPosition();
				app.updateTracklist();
			}
		}, {
			selector: '#scPosLength',
			method:   'change',
			handler:  function() {
				var pp = app.player.currentPosition,
					pos = app.player.position[pp];

				if (!app.player.position.length)
					return false;
				else if (app.modePlay) {
					$(this).val(pos.length);
					return false;
				}

				pos.length = $(this).val() - 0;

				if (app.player.currentLine >= pos.length)
					app.player.currentLine = pos.length - 1;

				app.player.countPositionFrames(pp);
				app.updateTracklist();
				app.updatePanelInfo();
			}
		}, {
			selector: '#scPosSpeed',
			method:   'TouchSpin',
			data: {
				initval: '6',
				min: 1, max: 31
			}
		}, {
			selector: '#scPosSpeed',
			method:   'change',
			handler:  function() {
				var pp = app.player.currentPosition,
					pos = app.player.position[pp];

				if (!app.player.position.length)
					return false;
				else if (app.modePlay) {
					$(this).val(pos.speed);
					return false;
				}

				pos.speed = $(this).val() - 0;

				app.player.countPositionFrames(pp);
				app.updateTracklist();
				app.updatePanelInfo();
			}
		}, {
			selector: '#scPosRepeat',
			method:   'change',
			handler:  function() {
				if (!app.player.position.length)
					return false;
				else if (app.modePlay) {
					$(this).val(app.player.repeatPosition + 1);
					return false;
				}
				else
					app.player.repeatPosition = $(this).val() - 1;
			}
		}, {
			selector: 'input[id^="scChnPattern"]',
			method:   'change',
			handler:  function(e) {
				var el = e.target,
					pp = app.player.currentPosition,
					chn = el.id.substr(-1) - 1,
					pos = app.player.position[pp],
					val = el.value - 0,
					prev = pos.ch[chn].pattern;

				if (!app.player.position.length)
					return false;
				else if (app.modePlay) {
					el.value = prev;
					return false;
				}

				pos.ch[chn].pattern = val;

				if (app.workingPattern === val || app.workingPattern === prev)
					app.updatePanelPattern();

				app.player.countPositionFrames(pp);
				app.updateTracklist();
				app.updatePanelInfo();
			}
		}, {
			selector: 'input[id^="scChnTrans"]',
			method:   'each',
			handler:  function(i, el) {
				$(this).TouchSpin({
					initval: '0',
					min: -24, max: 24
				}).change(function(e) {
					var el = e.target,
						chn = el.id.substr(-1) - 1,
						pos = app.player.position[app.player.currentPosition];

					if (!app.player.position.length)
						return false;
					else if (app.modePlay) {
						el.value = pos.ch[chn].pitch;
						return false;
					}
					else
						pos.ch[chn].pitch = el.value - 0;
				});
			}
		}, {
			selector: 'input[id^="scChnButton"]',
			method:   'each',
			handler:  function(i, el) {
				var cc = el.id.substr(-1);
				$(this).bootstrapToggle({
					on: cc,
					off: cc,
					onstyle: 'default',
					offstyle: 'default',
					size: 'mini',
					width: 58
				}).change(function(e) {
					var el = e.target;
					app.player.SAA1099.mute((el.value - 1), !el.checked);
				});
			}
		}, {
			selector: '#scSampleNumber,#scOrnTestSample',
			method:   'TouchSpin',
			data: {
				initval: '1',
				radix: 32,
				min: 1, max: 31
			}
		}, {
			selector: '#scSampleNumber',
			method:   'change',
			handler:  function() {
				app.workingSample = parseInt($(this).val(), 32);
				app.workingOrnTestSample = app.workingSample;
				app.updateSampleEditor(true);
				app.smpornedit.updateSamplePitchShift();
				$('#sbSampleScroll').scrollLeft(0);
				$('#scOrnTestSample').val(app.workingOrnTestSample.toString(32));
			}
		}, {
			selector: '#scOrnTestSample',
			method:   'change',
			handler:  function() { app.workingOrnTestSample = parseInt($(this).val(), 32) }
		}, {
			selector: '#scOrnNumber',
			method:   'TouchSpin',
			data: {
				initval: '1',
				radix: 16,
				min: 1, max: 15
			}
		}, {
			selector: '#scOrnNumber',
			method:   'change',
			handler:  function() {
				app.workingOrnament = parseInt($(this).val(), 16);
				app.smpornedit.updateOrnamentEditor(true);
			}
		}, {
			selector: '#txSampleName',
			method:   'change',
			handler:  function(e) { app.player.sample[app.workingSample].name = e.target.value }
		}, {
			selector: '#txOrnName',
			method:   'change',
			handler:  function(e) { app.player.ornament[app.workingOrnament].name = e.target.value }
		}, {
			selector: '#scSampleTone,#scOrnTone',
			method:   'each',
			handler:  function(i, el) {
				var cc = 'tx' + el.id.substr(2);
				$(this).TouchSpin({
					initval: app.workingSampleTone,
					min: 1, max: 96
				}).change(function(e) {
					var el = e.target, val = el.value - 0;
					app.workingSampleTone = val;
					$('#scSampleTone,#scOrnTone')
						.val(val.toString())
						.prev().val(app.player.tones[val].txt);
				}).wrapAll('<div id="' + cc + '"/>')
				  .removeAttr('style')
				  .prop('readonly', true)
				  .clone(false)
				  .removeAttr('id')
				  .insertBefore(this);

				$(this).trigger('change');
			}
		}, {
			selector: '#sbSampleScroll',
			method:   'scroll',
			handler:  function(e) {
				app.smpornedit.smpeditScroll = 0 | ((e.target.scrollLeft/ 1000) * 64);
				app.updateSampleEditor();
			}
		}, {
			selector: '#scSampleLength,#scSampleRepeat,#scOrnLength,#scOrnRepeat',
			method:   'TouchSpin',
			data: {
				initval: '0',
				min: 0, max: 255
			}
		}, {
			selector: '#chSampleRelease',
			method:   'change',
			handler:  function(e) {
				var sample = app.player.sample[app.workingSample];
				if (sample.end !== sample.loop)
					sample.releasable = e.target.checked;
				app.updateSampleEditor(true);
			}
		}, {
			selector: '#scSampleLength',
			method:   'change',
			handler:  function(e) {
				var sample = app.player.sample[app.workingSample],
					offset = parseInt(e.target.value, 10) - sample.end,
					looper = (sample.loop += offset);

				sample.end += offset;
				sample.loop = ((sample.end - looper) < 0) ? 0 : looper;

				app.updateSampleEditor(true);
			}
		}, {
			selector: '#scSampleRepeat',
			method:   'change',
			handler:  function(e) {
				var sample = app.player.sample[app.workingSample],
					value = parseInt(e.target.value, 10);

				sample.loop = sample.end - value;
				app.updateSampleEditor(true);
			}
		}, {
			selector: '#fxOrnChords button',
			method:   'each',
			handler:  function() {
				var id = $(this).text(),
					chord = app.smpornedit.chords[id],
					seqtxt = JSON.stringify(chord.sequence, null, 1).replace(/^\[|\]$|\s+/g, '');

				$(this).tooltip({
					html: true,
					animation: false,
					trigger: 'hover',
					delay: { "show": 500, "hide": 0 },
					title: chord.name + '<kbd>{ ' + seqtxt + ' }</kbd>'
				}).click(function() {
					var orn = app.player.ornament[app.workingOrnament],
						i, l = chord.sequence.length;

					orn.data.fill(0);
					orn.name = chord.name;
					orn.loop = 0;
					orn.end  = l;

					for (i = 0; i < l; i++)
						orn.data[i] = chord.sequence[i];

					app.smpornedit.updateOrnamentEditor(true);
				});
			}
		}, {
			selector: '#scOrnLength',
			method:   'change',
			handler:  function(e) {
				var orn = app.player.ornament[app.workingOrnament],
					offset = parseInt(e.target.value, 10) - orn.end,
					looper = (orn.loop += offset);

				orn.end += offset;
				orn.loop = ((orn.end - looper) < 0) ? 0 : looper;

				app.smpornedit.updateOrnamentEditor(true);
			}
		}, {
			selector: '#scOrnRepeat',
			method:   'change',
			handler:  function(e) {
				var orn = app.player.ornament[app.workingOrnament],
					value = parseInt(e.target.value, 10);

				orn.loop = orn.end - value;
				app.smpornedit.updateOrnamentEditor(true);
			}
		}, {
			selector: '#sample-tabpanel a[data-toggle="tab"]',
			method:   'on',
			param:    'show.bs.tab',
			handler:  function(e) {
				if (e.target.id === 'tab-pitchshift' && e.relatedTarget.id === 'tab-sampledata')
					app.smpornedit.updateSamplePitchShift();
			}
		}, {
			selector: 'a[id^="miFileImportDemo"]',
			method:   'click',
			handler:  function() {
				var fn = $(this).data().filename;
				if (!fn || app.modePlay || app.globalKeyState.lastPlayMode)
					return false;
				app.loadDemosong(fn);
			}
		}, {
			selector: 'a[id^="miHelp"]',
			method:   'click',
			handler:  function() {
				var el = $(this),
					fn = el.data().filename,
					title = el.text();
				if (!fn)
					return false;
				app.onCmdShowDocumentation(fn, title.slice(0, -1));
			}
		}, {
			selector: '#miAbout',
			method:   'click',
			handler:  function() { app.onCmdAbout() }
		}, {
			selector: '#miStop',
			method:   'click',
			handler:  function() { app.onCmdStop() }
		}, {
			selector: '#miSongPlay',
			method:   'click',
			handler:  function() { app.onCmdSongPlay() }
		}, {
			selector: '#miSongPlayStart',
			method:   'click',
			handler:  function() { app.onCmdSongPlayStart() }
		}, {
			selector: '#miPosPlay',
			method:   'click',
			handler:  function() { app.onCmdPosPlay() }
		}, {
			selector: '#miPosPlayStart',
			method:   'click',
			handler:  function() { app.onCmdPosPlayStart() }
		}, {
			selector: '#miToggleLoop',
			method:   'click',
			handler:  function() { app.onCmdToggleLoop() }
		}, {
			selector: 'button[id^="btPattern"]',
			method:   'click',
			handler:  function() { app[this.id.replace('btPattern', 'onCmdPat')]() }
		}, {
			selector: 'button[id^=btPos]',
			method:   'click',
			handler:  function() { app[this.id.replace('bt', 'onCmd')]() }
		}, {
			selector: 'button[id^="btSample"]',
			method:   'click',
			handler:  function() {
				var name = this.id.replace('btSample', 'onCmdSmp');
				if (name.endsWith('Stop'))
					name = name.replace('Smp', '');
				app[name]();
			}
		}, {
			selector: 'button[id^="btOrn"]',
			method:   'click',
			handler:  function() {
				var name = this.id.replace('btOrn', 'onCmdOrn');
				if (name.endsWith('Stop'))
					name = name.replace('Orn', '');
				app[name]();
			}
		}
	];

//---------------------------------------------------------------------------------------
	for (var i = 0, l = populatedElementsTable.length; i < l; i++) {
		var o = populatedElementsTable[i],
			data = o.handler || o.data,
			selector = o.selector || (o.global && window[o.global]);

		if (selector && o.method) {
			if (o.param)
				$(selector)[o.method](o.param, data);
			else
				$(selector)[o.method](data);
		}
	}
};
//---------------------------------------------------------------------------------------
