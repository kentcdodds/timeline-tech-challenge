var Timeline = (function (window, document, undefined) {

	/**
	 * Constant for the state of the Timeline
	 */
	var State = {
		PLAY: 'Play',
		PAUSE: 'Pause',
		RESET: 'Reset'
	};

	/**
	 * Constants for handling the interval
	 */
	var YEAR_AS_MILLIS = 2000, // How many milliseconds should represent a year on the timeline
		INTERVAL_DELAY = 250; // Tick every .25 seconds (allows accuracy when pausing without ticking too frequently)

	/**
	 * Timeline component
	 *
	 * @param {String} url The JSON data url for timeline
	 */
	function Timeline(url) {
		this.url = url;
	}

	// Timeline template
	Timeline.prototype.template =
		'<div id="timeline">' +
			'<div id="frames"></div>' +
			'<button id="control"></button>' +
		'</div>';

	/**
	 * Render this Timeline to the DOM
	 *
	 * @param {Element} parent The element to render this Timeline to
	 */
	Timeline.prototype.render = function (parent) {
		var frag = document.createElement('div');
		frag.innerHTML = this.template;

		this.element = frag.firstElementChild;
		parent = parent || document.body;
		parent.appendChild(this.element);

		// Initialize state
		this.reset(false);

		this.fetch(function (data) {
			// Make sure data and events exist
			if (!data || !data.events) {
				return;
			}

			// Get frames and clear content
			var frames = document.getElementById('frames');
			frames.innerHTML = '';

			// Render title frame
			var title = document.createElement('div');
			title.className = 'frame active';
			title.innerHTML = data.firstName + ' ' + data.lastName;
			frames.appendChild(title);

			// Render event frames
			for (var i=0, l=data.events.length; i<l; i++) {
				var event = data.events[i],
					frame = document.createElement('div');

				frame.className = 'frame staged';
				frame.innerHTML = 'At age ' + event.age + ', ' + data.firstName + ' ' + event.content;

				frames.appendChild(frame);
			}
		});
	};

	/**
	 * Fetch the data from the server
	 *
	 * @param {Function} callback The function to invoke once data has been fetched
	 */
	Timeline.prototype.fetch = function (callback) {
		if (typeof this.data === 'undefined') {
			var xhr = new XMLHttpRequest(),
				self = this;
			xhr.onload = function () {
				try {
					self.data = JSON.parse(this.responseText);
					callback(self.data);
				} catch (e) {
					// Ignore exception
					// This may happen if url cannot be resolved
					// Or if response is not parsable as JSON
				}
			};
			xhr.open('GET', this.url, true);
			xhr.send();
		} else {
			callback(this.data);
		}
	};

	/**
	 * Play this Timeline
	 */
	Timeline.prototype.play = function () {
		this.__state(State.PAUSE);

		// Short circuit if data hasn't been fetched
		if (!this.data) {
			return;
		}

		// Reuse existing frames and current if available
		if (typeof this.frames === 'undefined' ||
			typeof this.current === 'undefined') {
			this.__init();
		}

		// Setup timer to advance frames
		var self = this;
		this.timer = setInterval(function () {
			self.__tick();
		}, INTERVAL_DELAY);

		// Advance to first slide
		if (this.current === 0 && this.frames.length > 0) {
			this.__advance();
		}
	};

	/**
	 * Pause this Timeline
	 */
	Timeline.prototype.pause = function () {
		this.__state(State.PLAY);

		clearInterval(this.timer);
		delete this.timer;
	};

	/**
	 * Reset this Timeline
	 */
	Timeline.prototype.reset = function (play) {
		this.__state(State.PLAY);

		delete this.timer;
		delete this.frames;
		delete this.current;

		// Reset className on frames
		var frames = this.element.querySelector('#frames').children;
		for (var i=0, l=frames.length; i<l; i++) {
			frames[i].className = 'frame ' + (i === 0 ? 'active' : 'staged');
		}

		// Automatically play if not explicitly instructed not to
		if (play !== false) {
			this.play();
		}
	};

	/**
	 * Internal method for updating the state.
	 * Specifically this updates the label and action on the button.
	 *
	 * @param {String} state The state to update to (see State constant)
	 */
	Timeline.prototype.__state = function (state) {
		if (state) {
			var button = this.element.querySelector('#control'),
				self = this;
			button.innerHTML = state;
			button.onclick = function () {
				self[state.toLowerCase()]();
			};
		}
	};

	/**
	 * Internal method for initializing the frames to be played
	 */
	Timeline.prototype.__init = function () {
		this.frames = [];
		for (var i=0, l=this.data.events.length; i<l; i++) {
			var event = this.data.events[i],
				start = event.age,
				end = this.data.events[i+1] ? this.data.events[i+1].age : this.data.age;
			this.frames[i] = (end - start) * (YEAR_AS_MILLIS / INTERVAL_DELAY);
		}

		this.current = 0;
	};

	/**
	 * Internal method for advancing the current frame
	 */
	Timeline.prototype.__advance = function () {
		var frames = this.element.querySelector('#frames').children;
		frames[this.current].className = 'frame';
		frames[this.current + 1].className = 'frame active';
	};

	/**
	 * Internal method for handling each tick of the interval
	 */
	Timeline.prototype.__tick = function () {
		// Decrement remaining ticks for current frame
		this.frames[this.current]--;

		// If no more tick remaining...
		if (this.frames[this.current] === 0) {
			// Increment current frame
			this.current++;

			// Advance if more frames remain
			if (this.current < this.frames.length) {
				this.__advance();
			}
			// Otherwise clear the interval and update state
			else {
				this.__state(State.RESET);
				clearInterval(this.timer);
				delete this.timer;
			}
		}
	};

	return Timeline;
})(window, document);
