/**
 * Author: gaocheng@douban.com
 *
 * TODO: 自定义搜索 control
 * TODO: infoWindow
 *
 */

(function($) {

	var dui = window.dui || {};

	dui.iMap = (function() {
		var mapDefault = {
			width: 500,
			height: 400,
			lat: 39.92,
			lng: 116.46,
			zoom: 8,
			type: 'ROADMAP'
		},
		markerDefault = {
			lat: mapDefault.lat,
			lng: mapDefault.lng,
            latLng: function(){return new google.maps.LatLng(mapDefault.lat, mapDefault.lng)}(),
			draggable: false,
			handleDrag: function(){},
			clickable: false,
			handleClick: function(){},
			visible: true
		},
		controlDefault = {
			disableDefaultUI: false,
			panControl: true,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			},
			mapTypeControl: true,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
			},
			scaleControl: true,
			streetViewControl: false,
			overviewMapControl: false,
            searchControl: false
		},
        centerDefault = {
			lat: 39.92,
			lng: 116.46,
        },
		defaults = $.extend(mapDefault, controlDefault);

		function _setCenter(map, latLng) {
            var opt = $.extend(centerDefault, latLng || {});

			map.setCenter(opt.latLng);
		}

		// 判断是否是函数
		// from John Resig
		function _isFunction(fn) {
			return !! fn && ! fn.nodeName && fn.constructor != String && fn.constructor != RegExp && fn.constructor != Array && /function/i.test(fn + "");
		}

		function _setControlPanel(map, options) {}

		/**
         * 创建地图
         * @$ele 用来包裹地图的 jQuery 对象
         * @options 地图的参数
         * @callback 地图创建之后的回调函数
         */
		function _createMap($ele, options, callback) {
			var opt = $.extend(defaults, options || {});
            console.log('_createMap');
            console.log(opt);
			$ele.css({
				'width': opt.width,
				'height': opt.height
			});

			opt.mapTypeId = google.maps.MapTypeId[opt.type];
			var map = new google.maps.Map($ele.get(0), opt);

			var latlng = new google.maps.LatLng(opt.lat, opt.lng);
			map.setCenter(latlng);

            console.log(arguments);
			if (arguments.length === 3 && _isFunction(arguments[2])) {
                console.log(map);
				arguments[2](map);
			} else if (arguments.length === 2 && _isFunction(arguments[1])) {
                console.log(map);
				arguments[1](map);
			}

            // 显示搜索控件
            if(opt.searchControl){
            }

			return map;

		}

		/**
         * 创建 Marker
         *
         */
		function _createMarker(map, options) {
			var opt = $.extend(markerDefault, options || {});
            console.log('_createMarker');
            console.log(opt);
			var marker = new google.maps.Marker({
				position: opt.latLng,
				map: map,
                draggable: opt.draggable,
                cilckable: opt.clickable
			});

			// 如果可拖拽，且有拖拽事件
			if (opt.draggable && opt.handleDrag && _isFunction(opt.handleDrag)) {
                google.maps.event.addListener(marker, 'dragend', opt.handleDrag);
			}

			// 如果可点击，且有点击事件
			if (opt.clickable && opt.handleClick && _isFunction(opt.handleClick)) {
                google.maps.event.addListener(marker, 'click', opt.handleClick);
			}

			return marker;
		}

        /** 事件绑定
         * @map 可以是 map 对象，也可以是 marker 对象
         * @events 暂时只为 click
         */
        function _bind(map, events, handle){
            switch(events) {
                case 'click':
                    google.maps.event.addListener(map, 'click', handle);
                    break;

                case 'zoom':
                    // code
                    break;

                case 'drag':
                    // code
                    break;

                default:
                    // code
            }
        }

		return {
			createMap: function($element, options) {
				return _createMap.apply(this, arguments);
			},
            setCenter: function(map, latLng){
                _setCenter(map, latLng);
            },
			createMarker: function(map, options) {
				return _createMarker(map, options);
			},
			removeMarker: function() {},
			moveMarker: function() {},
			init: function($element, options, callback) {
				return _createMap.apply(this, arguments);
				//return _createMap($element, options, callback);
			},
            bind: function(map, events, handle){
                _bind(map, events, handle);
            },
            search: function(){
                return _search();
            }
		};
	})();

	window.dui = dui;

})(jQuery)
