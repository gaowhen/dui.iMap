/**
 * Author: gaocheng@douban.com
 *
 * TODO: 自定义搜索 control
 * TODO: 创建地图时，也可以只传入经纬度
 *
 */

(function($) {

	var dui = window.dui || {};

    dui.log = function(obj) {
        if (typeof(console) != 'undefined' && typeof(console.log) == 'function') {
            console.log(obj);
        }
    };

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
			latLng: function(){ return new google.maps.LatLng(mapDefault.lat, mapDefault.lng) }(),
			draggable: false,
			handleDrag: function() {},
			clickable: false,
			handleClick: function() {},
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
			searchControl: false,
            searchCallback: ''
		},
		centerDefault = {
			lat: mapDefault.lat,
			lng: mapDefault.lng,
			latLng: function(){ return new google.maps.LatLng(mapDefault.lat, mapDefault.lng) }()
		},
		defaults = $.extend(mapDefault, controlDefault),
        markers = [];

		function _setCenter(map, options) {
			var opt = $.extend(centerDefault, options || {});

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
			dui.log('_createMap');
			dui.log(opt);
			$ele.css({
				'width': opt.width,
				'height': opt.height
			});

			opt.mapTypeId = google.maps.MapTypeId[opt.type];
			var map = new google.maps.Map($ele.get(0), opt);

			var latlng = new google.maps.LatLng(opt.lat, opt.lng);
			map.setCenter(latlng);

			dui.log(arguments);
			if (arguments.length === 3 && _isFunction(arguments[2])) {
				dui.log(map);
				arguments[2](map);
			} else if (arguments.length === 2 && _isFunction(arguments[1])) {
				dui.log(map);
				arguments[1](map);
			}

			// 显示搜索控件
			if (opt.searchControl) {
				_customControlSearch(map, opt.searchCallback);
			}

			return map;
		}

		/**
         * 创建 Marker
         *
         */
		function _createMarker(map, options) {
			dui.log('_createMarker');
			var opt = $.extend(markerDefault, options || {}),
                marker = new google.maps.Marker({
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

            markers.push(marker);

			return marker;
		}

        /**
         * 删除 Marker
         */
        function _removeMarker(marker){
            marker.setMap(null);
        }

		/**
         * 事件绑定
         * @ele 可以是 map 对象，也可以是 marker 对象
         * @events 暂时只为 click
         */
		function _bind(ele, events, handle) {
			switch (events) {
                case 'click':
                    google.maps.event.addListener(ele, 'click', handle);
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

		/**
         * 自定义搜索控件
         *
         */
		function _customControlSearch(map, callback) {
			var $search = $('<div id="search-control"></div>'),
                $searchUI = $('<div id="search-control-ui"></div>'),
                $txt = $('<input type="text" name="search-txt" id="search-txt" />'),
                $btn = $('<input type="button" id="btn-search" value="search" />');

			$searchUI.append($txt).append($btn);
			$search.append($searchUI);

			map.controls[google.maps.ControlPosition.TOP_LEFT].push($search.get(0));
			google.maps.event.addDomListener($btn.get(0), 'click', function() {
                var address = $txt.val();
                _search(map, address, callback);
            });

            // 回车搜索
            $txt.bind('keydown', function(e){
                if(e.keyCode == '13'){
                    var address = $txt.val();
                    _search(map, address);
                }
            });

            // 地址提示
             $txt.autocomplete({
                source: function(request, response) {
                    dui.log('source');
                    dui.log(request);
                    var geocoder = new google.maps.Geocoder();

                    geocoder.geocode( {'address': request.term }, function(results, status) {
                        dui.log(results);
                        response($.map(results, function(item) {
                            return {
                                label:  item.formatted_address,
                                value: item.formatted_address,
                                latitude: item.geometry.location.lat(),
                                longitude: item.geometry.location.lng()
                            }
                        }));
                    })
                },
                select: function(event, ui) {
                    if(markers.length){
                        $.each(markers, function(i, v){
                            v.setMap(null);
                        });
                    }

                    var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude),
                        marker = _createMarker(map, {latLng: location});

                    _setCenter(map, {latLng: location});
                    map.setZoom(15);
                }
            });
		}

		/**
         * 搜索
         *
         */
		function _search(map, address, callback) {

            if(markers.length){
                $.each(markers, function(i, v){
                    v.setMap(null);
                });
            }

			var geocoder = new google.maps.Geocoder();

			geocoder.geocode({
                    address: address
                },
                function(results, status) {
                    dui.log(status)
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setZoom(15);
                        var latLng = results[0].geometry.location;
                        _createMarker(map, {latLng: latLng});
                        _setCenter(map, {latLng: latLng});
                    } else {
                        // TODO
                        // 查找不到的处理
                        if(_isFunction(callback)){
                            callback(map);
                        }else{
                            alert("难道你是火星人吗，在地球上没找到你要找的地方。");
                        }
                    }
			});
		}

        /**
         * info window
         */
        function _infowindow(map, marker, content){
            var infowindow = new google.maps.InfoWindow({content: content});

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });

            return infowindow;
        }

		return {
			createMap: function($element, options) {
				return _createMap.apply(this, arguments);
			},
			setCenter: function(map, options) {
				_setCenter(map, options);
			},
			createMarker: function(map, options) {
				return _createMarker(map, options);
			},
			removeMarker: function(marker) {
                _removeMarker(marker);
            },
            infowindow: function(map, marker, content){
                _infowindow(map, marker, content);
            },
			init: function($element, options, callback) {
				return _createMap.apply(this, arguments);
				//return _createMap($element, options, callback);
			},
			bind: function(map, events, handle) {
				_bind(map, events, handle);
			},
			search: function(address) {
				return _search(address);
			},
            infowindow: function(map, marker, content){
                return _infowindow(map, marker, content);
            }
		};
	})();

	window.dui = dui;

})(jQuery)
