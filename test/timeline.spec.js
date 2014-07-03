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
			var el = document.getElementById('timeline');
			if (el && el.parentNode) {
				el.parentNode.removeChild(el);
			}
		});

		it('should provide a render method', function () {
			expect(typeof timeline.render).toEqual('function');
		});

		it('should render to the element specified', function () {
			timeline.render(document.body);
			expect(document.getElementById('timeline').parentNode).toEqual(document.body);
		});

		it('should provide a template', function () {
			expect(timeline.template).toEqual('<div id="timeline"><div id="frames"></div><button id="control"></button></div>');
		});

		it('should render from a template', function () {
			var parent = document.createElement('div');
			timeline.render(parent);
			expect(parent.innerHTML).toEqual(timeline.template);
		});

		it('should render events', function () {
			timeline.data = MOCK_DATA;
			timeline.render(document.body);
			expect(document.getElementById('frames').children.length).toEqual(2);
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

		it('should provide a play method', function () {
			expect(typeof timeline.play).toEqual('function');
		});

		it('should provide a pause method', function () {
			expect(typeof timeline.pause).toEqual('function');
		});

		it('should provide a reset method', function () {
			expect(typeof timeline.reset).toEqual('function');
		});
	});
});
