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
			expect(document.getElementById('timeline').parentNode).toEqual(document.body);
		});

		it('should render to document.body if no element is specified', function () {
			timeline.render();
			expect(document.getElementById('timeline').parentNode).toEqual(document.body);
		});

		it('should render from a template', function () {
			var parent = document.createElement('div');
			timeline.render(parent);
			expect(parent.innerHTML).toEqual('<div id="timeline"><div id="frames"></div><button id="control">Play</button></div>');
		});

		it('should render events', function () {
			timeline.data = MOCK_DATA;
			timeline.render();
			expect(document.getElementById('frames').children.length).toEqual(MOCK_DATA.events.length + 1);
			expect(document.getElementById('frames').children[0].className).toEqual('frame active');
			expect(document.getElementById('frames').children[0].innerHTML).toEqual(MOCK_DATA.firstName + ' ' + MOCK_DATA.lastName);
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

	describe('controls', function () {
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

		it('should provide a pause method', function () {
			expect(typeof timeline.pause).toEqual('function');
		});

		it('should provide a reset method', function () {
			expect(typeof timeline.reset).toEqual('function');
		});

		it('should set state to pause when play is called', function () {
			timeline.render();
			var button = timeline.element.querySelector('#control');
			button.innerHTML = '';
			timeline.play();
			expect(button.innerHTML).toEqual('Pause');
		});

		it('should set state to play when pause is called', function () {
			timeline.render();
			var button = timeline.element.querySelector('#control');
			button.innerHTML = '';
			timeline.pause();
			expect(button.innerHTML).toEqual('Play');
		});
	});
});
