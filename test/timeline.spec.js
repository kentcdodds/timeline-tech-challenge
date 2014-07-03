describe('timeline', function () {
	var MOCK_DATA = {
	  "firstName" : "Chip",
	  "lastName" : "Bitly",
	  "age" : 46,
	  "events" : [
	    {
	      "age": 0,
	      "content": "was born"
	    },
	    {
	      "age": 4,
	      "content": "learned to ride a bike"
		},
	    {
	      "age": 12,
	      "content": "was successfully potty trained"
	    }
	  ]
	};

	describe('constructor', function () {
		it('should provide a constructor', function () {
			expect(typeof Timeline).toEqual('function');
		});

		it('should accept JSON data url', function () {
			var url = '/timeline.json',
				timeline = new Timeline(url);
			expect(timeline.url).toEqual(url);
		});
	});

	describe('render', function () {
		var timeline;
		beforeEach(function () {
			timeline = new Timeline();
		});

		afterEach(function () {
			if (timeline.element && timeline.element.parentNode) {
				timeline.element.parentNode.removeChild(timeline.element);
			}
		});

		it('should provide a render method', function () {
			expect(typeof timeline.render).toEqual('function');
		});

		it('should render to the element specified', function () {
			timeline.render(document.body);
			expect(timeline.element.parentNode).toEqual(document.body);
		});

		it('should render to document.body if no element is specified', function () {
			timeline.render();
			expect(timeline.element.parentNode).toEqual(document.body);
		});

		it('should render from a template', function () {
			var parent = document.createElement('div');
			timeline.render(parent);
			expect(parent.innerHTML).toEqual('<div class="timeline"><div class="frames"></div><button class="control">Play</button></div>');
		});

		it('should render events', function () {
			timeline.data = MOCK_DATA;
			timeline.render();

			var frames = timeline.element.querySelector('.frames');
			expect(frames.children.length).toEqual(1);
			expect(frames.children[0].className).toEqual('frame active');
			expect(frames.children[0].innerHTML).toEqual(MOCK_DATA.firstName + ' ' + MOCK_DATA.lastName);
		});

		it('should protect against xss', function () {
			var dangerous = '<script>alert(\'foo\');</script>',
				safe = '&lt;script&gt;alert(\'foo\');&lt;/script&gt;';

			timeline.data = MOCK_DATA;
			timeline.data.firstName = dangerous;
			timeline.data.events[0].content = dangerous;
			timeline.render();
			timeline.__init();
			timeline.__advance();

			var frames = timeline.element.querySelector('.frames').children;
			expect(frames[0].innerHTML).toEqual(safe + ' Bitly');
			expect(frames[1].innerHTML).toEqual('At age 0, ' + safe + ' ' + safe);
		});
	});

	describe('fetch', function () {
		var timeline;

		beforeEach(function () {
			timeline = new Timeline('/timeline.json');
			jasmine.Ajax.install();
		});

		it('should provide a fetch method', function () {
			expect(typeof timeline.fetch).toEqual('function');
		});

		it('should load data from url', function () {
			timeline.fetch();
			var request = jasmine.Ajax.requests.mostRecent();
			expect(request.url).toBe('/timeline.json');
			expect(request.method).toBe('GET');
		});

		it('should invoke callback', function () {
			var spy = jasmine.createSpy('callback');
			timeline.fetch(spy);
			var request = jasmine.Ajax.requests.mostRecent();
			request.onload();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe('play', function () {
		var timeline;

		beforeEach(function () {
			timeline = new Timeline();
		});

		afterEach(function () {
			if (timeline.element && timeline.element.parentNode) {
				timeline.element.parentNode.removeChild(timeline.element);
			}
		});

		it('should provide a play method', function () {
			expect(typeof timeline.play).toEqual('function');
		});

		it('should set state to pause when play is called', function () {
			timeline.render();
			var button = timeline.element.querySelector('.control');
			button.innerHTML = '';
			timeline.play();

			expect(button.innerHTML).toEqual('Pause');
		});

		it('should create timer when play is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.play();

			expect(timeline.timer).toNotEqual(undefined);
		});

		it('should create frames when play is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.play();

			expect(Array.isArray(timeline.frames)).toBe(true);
			expect(timeline.frames.length).toEqual(MOCK_DATA.events.length);
		});

		it('should track current frame when play is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.play();

			expect(timeline.current).toEqual(0);
		});

		it('should reuse existing frames & current', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.frames = [1, 2, 3];
			timeline.current = 37;
			timeline.play();

			expect(timeline.frames).toEqual([1, 2, 3]);
			expect(timeline.current).toEqual(37);
		});
	});

	describe('pause', function () {
		var timeline;

		beforeEach(function () {
			timeline = new Timeline();
		});

		afterEach(function () {
			if (timeline.element && timeline.element.parentNode) {
				timeline.element.parentNode.removeChild(timeline.element);
			}
		});

		it('should provide a pause method', function () {
			expect(typeof timeline.pause).toEqual('function');
		});

		it('should set state to play when pause is called', function () {
			timeline.render();
			var button = timeline.element.querySelector('.control');
			button.innerHTML = '';
			timeline.pause();

			expect(button.innerHTML).toEqual('Play');
		});

		it('should cancel timer when pause is called', function () {
			timeline.render();
			timeline.play();
			timeline.pause();

			expect(timeline.timer).toEqual(undefined);
		});

		it('should preserve frames & current when pause is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.play();
			timeline.current = 1;
			timeline.pause();

			expect(Array.isArray(timeline.frames)).toEqual(true);
			expect(timeline.current).toEqual(1);
		});
	});

	describe('reset', function () {
		var timeline;

		beforeEach(function () {
			timeline = new Timeline();
		});

		afterEach(function () {
			if (timeline.element && timeline.element.parentNode) {
				timeline.element.parentNode.removeChild(timeline.element);
			}
		});

		it('should provide a reset method', function () {
			expect(typeof timeline.reset).toEqual('function');
		});

		it('should reset frames & current when reset is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.play();
			timeline.current = 1;
			timeline.reset(false);

			expect(timeline.frames).toEqual(undefined);
			expect(timeline.current).toEqual(undefined);
		});

		it('should reset frame className when reset is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();

			var frames = timeline.element.querySelector('.frames').children,
				i, l;
			for (i=0, l=frames.length; i<l; i++) {
				frames[i].className = 'frame ' + (i === l - 1 ? 'active' : 'staged');
			}

			timeline.reset(false);

			for (i=0, l=frames.length; i<l; i++) {
				expect(frames[i].className).toEqual('frame ' + (i === 0 ? 'active' : 'staged'));
			}
		});

		it('sould automatically play when reset is called', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.reset();

			expect(timeline.timer).toNotEqual(undefined);
			expect(timeline.current).toNotEqual(undefined);
			expect(timeline.frames.length).toEqual(MOCK_DATA.events.length);
		});
	});

	describe('internals', function () {
		var timeline;

		beforeEach(function () {
			timeline = new Timeline();
		});

		afterEach(function () {
			if (timeline.element && timeline.element.parentNode) {
				timeline.element.parentNode.removeChild(timeline.element);
			}
		});

		it('should update state', function () {
			timeline.render();
			var button = timeline.element.querySelector('.control');

			timeline.__state('Start');
			expect(button.innerHTML).toEqual('Start');

			timeline.__state('Pause');
			expect(button.innerHTML).toEqual('Pause');

			timeline.__state('Reset');
			expect(button.innerHTML).toEqual('Reset');
		});

		it('should init frames', function () {
			timeline.data = MOCK_DATA;
			timeline.__init();

			expect(timeline.current).toEqual(0);
			expect(Array.isArray(timeline.frames)).toBe(true);
			expect(timeline.frames.length).toEqual(MOCK_DATA.events.length);
			expect(timeline.frames[0]).toEqual(32);
			expect(timeline.frames[1]).toEqual(64);
			expect(timeline.frames[2]).toEqual(272);
		});

		it('should advance frames', function () {
			timeline.data = MOCK_DATA;
			timeline.render();

			var frames = timeline.element.querySelector('.frames').children;

			function run(current) {
				runs(function () {
					timeline.current = current;
					timeline.__advance();
				});

				waitsFor(function () {
					return frames[0].className === 'frame' &&
							frames[1].className === 'frame active';
				});

				runs(function () {
					expect(frames.length).toEqual(2);
					expect(frames[0].className).toEqual('frame');
					expect(frames[1].className).toEqual('frame active');
				});
			}

			for (var i=0, l=MOCK_DATA.events.length; i<l; i++) {
				run(i);
			}
		});

		it('should update on tick', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			timeline.__init();

			expect(timeline.frames[timeline.current]).toEqual(32);

			timeline.__tick();
			expect(timeline.current).toEqual(0);
			expect(timeline.frames[timeline.current]).toEqual(31);

			var i;
			// Tick through the rest of the first frame
			for (i=0; i<31; i++) {
				timeline.__tick();
			}
			expect(timeline.current).toEqual(1);
			expect(timeline.frames[timeline.current]).toEqual(64);

			// Tick through all the remaining frames
			for (i=0; i<336; i++) {
				timeline.__tick();
			}
			expect(timeline.current).toEqual(3);
			expect(timeline.frames[timeline.current-1]).toEqual(0);
			expect(timeline.timer).toEqual(undefined);
		});
	});
});
