/*global _, angular */

angular.module('cyViewerApp')
    .controller('MainCtrl', function($scope, $http, $location, $routeParams, $window, Network, VisualStyles, Gist) {

        'use strict';

        // If user load data from gist, they need to use this file name for Style.
        var GIST_STYLE_FILE_NAME = 'style.json';

        // Name of network tag in the DOM
        var NETWORK_SECTION_ID = '#network';
	var networkData = {};
	var vs = {};
        // Default Visual Style file location.
        var PRESET_STYLE_FILE = encodeURIComponent('http://localhost:3000/data/style.json');
        // var PRESET_STYLE_FILE = 'https%3a%2f%2fdl%2edropboxusercontent%2ecom%2fu%2f161833%2fstyle%2ejson';

        // Default Visual Style name to be selected.
        var DEFAULT_VISUAL_STYLE_NAME = 'default';

        var NETWORK_FILE = 'data/gal.cyjs'; //CHANGES MADE!!
        var visualStyleFile = 'data/galVS.json';
	//var visualStyleFile;

        var gistStyle = null;

        // Parse url parameters
        var gistId = $routeParams.id;
        var zoomLevel = $routeParams.zoom;
        var panX = $routeParams.x;
        var panY = $routeParams.y;

        // Application global objects
        $scope.networks = {};
        $scope.visualStyles = {};
        $scope.styleNames = [];
        $scope.networkNames = [];
        $scope.currentVS = DEFAULT_VISUAL_STYLE_NAME;
        $scope.currentNetworkData = null;

        $scope.browserState = {
            show: false
        };
        $scope.overlayState = {
            show: true
        };
        $scope.toolbarState = {
            show: true
        };

        $scope.bg = {
            color: '#FAFAFA'
        };

        $scope.columnNames = [];
        $scope.edgeColumnNames = [];
        $scope.networkColumnNames = [];

        var originalLocation = $location.absUrl().split('?')[0];

        console.log('GistID: ' + gistId);
        //console.log('Network rendering start... ' + $routeParams.url);
        //NETWORK_FILE = $routeParams.url;
	
        /*var styleLocation = $scope.encodedStyle;
        if (!styleLocation) {
            visualStyleFile = PRESET_STYLE_FILE;
        } else {
            visualStyleFile = $scope.encodedStyle;
        }*/

        // Basic settings for the Cytoscape window
        var options = {
            showOverlay: false,
            minZoom: 0.01,
            maxZoom: 200,

            layout: {
                name: 'preset'
            },

            ready: function() {
                $scope.cy = this;
                $scope.cy.load(networkData.elements);

		$scope.cy = cy;
                $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE_NAME].style).update();
                updateNetworkData(cy);

                /*if (!gistStyle) {
                    VisualStyles.query({
                        styleUrl: visualStyleFile
                    }, function(vs) {
                        init(vs);
                        dropSupport();
                        setEventListeners();
                        var newStyle = $routeParams.selectedstyle;
                        if (!newStyle) {
                            newStyle = DEFAULT_VISUAL_STYLE_NAME;
                        }
                        $scope.cy.style().fromJson($scope.visualStyles[newStyle].style).update();
                        $scope.style = newStyle;
                        angular.element('.loading').remove();
                    });
                } else {
                    init(gistStyle);
                    dropSupport();
                    setEventListeners();
                    $scope.cy.style().fromJson($scope.visualStyles[DEFAULT_VISUAL_STYLE_NAME].style).update();
                    $scope.style = DEFAULT_VISUAL_STYLE_NAME;
                    angular.element('.loading').remove();
                }*/
            }
        };



	function updateNetworkData(cy) {
            var dropZone = $('#network');
            dropZone.on('dragenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            dropZone.on('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            dropZone.on('drop', function (e) {
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                var networkFile = files[0];
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var network = JSON.parse(evt.target.result);
                    var networkName = network.data.name;
                    console.log("NetworkName = " + networkName);
                    if(networkName === undefined) {
                        networkName = "Unknown";
                    }
                    $scope.$apply(function() {
                        $scope.networks[networkName] = network;
                        $scope.networkNames.push(networkName);
                        $scope.currentNetworkData = networkName;
                        console.log($scope.networkNames);
                    });
                    cy.load(network.elements);
                };
                reader.readAsText(networkFile);
            });
        }



        /*function dropSupport() {
            var dropZone = angular.element(NETWORK_SECTION_ID);
            dropZone.on('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });

            dropZone.on('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });
            dropZone.on('drop', function(e) {
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                var networkFile = files[0];
                var reader = new FileReader();
                reader.onload = function(evt) {
                    var network = JSON.parse(evt.target.result);
                    var networkName = 'Unknown';
                    // Check data section is available or not.
                    networkData = network.data;
                    if (networkData !== undefined) {
                        if (networkData.name !== undefined) {
                            networkName = networkData.name;
                            $scope.currentNetworkData = networkData;
                        }
                    }

                    console.log($scope.networkNames);

                    while (_.contains($scope.networkNames, networkName)) {
                        networkName = networkName + '*';
                    }

                    $scope.$apply(function() {
                        $scope.networks[networkName] = network;
                        $scope.networkNames.push(networkName);
                        $scope.currentNetwork = networkName;
                        console.log($scope.networkNames);
                    });
                    $scope.cy.load(network.elements);
                    reset();
                };
                reader.readAsText(networkFile);
            });
        }*/

        /*function init(vs) {
            $scope.nodes = networkData.elements.nodes;
            $scope.edges = networkData.elements.edges;
            initVisualStyleCombobox(vs);

            // Set network name
            var networkName = networkData.data.name;
            if (!$scope.networks[networkName]) {
                $scope.networks[networkName] = networkData;
                $scope.networkNames.push(networkName);
                $scope.currentNetwork = networkData.data.name;
            }
            // Get column names
            setColumnNames();

            if ($routeParams.x !== undefined && $routeParams.y !== undefined) {
                $scope.cy.pan({
                    x: parseFloat(panX),
                    y: parseFloat(panY)
                });
            }
            if ($routeParams.zoom) {
                $scope.cy.zoom(parseFloat(zoomLevel));
            }

            if ($routeParams.bgcolor) {
                $scope.bg.color = $routeParams.bgcolor;
            }
        }*/

        function setColumnNames() {
            $scope.columnNames = [];
            $scope.edgeColumnNames = [];
            $scope.networkColumnNames = [];

            var oneNode = $scope.nodes[0];
            for (var colName in oneNode.data) {
                $scope.columnNames.push(colName);
            }
            var oneEdge = $scope.edges[0];
            for (var edgeColName in oneEdge.data) {
                $scope.edgeColumnNames.push(edgeColName);
            }
            for (var netColName in networkData.data) {
                $scope.networkColumnNames.push(netColName);
            }
        }

        function reset() {
            $scope.selectedNodes = {};
            $scope.selectedEdges = {};
        }

        /*
         Event listener setup for Cytoscape.js
         */
        function setEventListeners() {
            $scope.selectedNodes = {};
            $scope.selectedEdges = {};

            var updateFlag = false;

            // Node selection
            $scope.cy.on('select', 'node', function(event) {
                var id = event.cyTarget.id();
                $scope.selectedNodes[id] = event.cyTarget;
                updateFlag = true;
            });

            $scope.cy.on('select', 'edge', function(event) {
                var id = event.cyTarget.id();
                $scope.selectedEdges[id] = event.cyTarget;
                updateFlag = true;
            });

            // Reset selection
            $scope.cy.on('unselect', 'node', function(event) {
                var id = event.cyTarget.id();
                delete $scope.selectedNodes[id];
                updateFlag = true;
            });
            $scope.cy.on('unselect', 'edge', function(event) {
                var id = event.cyTarget.id();
                delete $scope.selectedEdges[id];
                updateFlag = true;
            });

            setInterval(function() {
                if (updateFlag && $scope.browserState.show) {
                    console.log('* update called');
                    $scope.$apply();
                    updateFlag = false;
                }
            }, 300);

        }

        /*function initVisualStyleCombobox(vs) {
            _.each(vs, function(visualStyle) {
                $scope.visualStyles[visualStyle.title] = visualStyle;
            });
        }*/


        $scope.toggleTableBrowser = function() {
            $scope.browserState.show = !$scope.browserState.show;
        };

        $scope.toggleOverlay = function() {
            $scope.overlayState.show = !$scope.overlayState.show;
        };

        $scope.toggleToolbar = function() {
            $scope.toolbarState.show = !$scope.toolbarState.show;
        };

        $scope.fit = function() {
            $scope.cy.fit();
        };

        $scope.encodeUrl = function() {
            var pan = $scope.cy.pan();
            var zoom = $scope.cy.zoom();

            // The following fields should be encoded because it may includes special chars.
            var bgColor = encodeURIComponent($scope.bg.color);
            var encodedStyleName = encodeURIComponent($scope.currentVS);
            console.log(zoom);
            console.log(encodedStyleName);
            console.log(bgColor);
            $scope.encodedUrl = originalLocation + '?selectedstyle=' + encodedStyleName +
                '&x=' + pan.x + '&y=' + pan.y + '&zoom=' + zoom + '&bgcolor=' + bgColor;
        };


        // Encode visualization URL.
        $scope.shortenUrl = function() {
            var request = $http({
                method: 'post',
                url: 'https://www.googleapis.com/urlshortener/v1/url',
                data: {
                    longUrl: $scope.encodedUrl
                }
            });
            // Store the data-dump of the FORM scope.
            request.success(
                function(json) {
                    $scope.encodedUrl = json.id;
                    angular.element('#shareUrl').select();
                }
            );
        };



	/////////////New content
	$scope.switchNetwork = function(networkName) {
	     $scope.currentNetworkData = networkName;//changed to include currentNetworkData as opposed to only currentNetwork
            //$scope.currentNetwork = networkName;
            var network = $scope.networks[networkName];
            $scope.cy.load(network.elements);
        };

        //
        // Apply Visual Style
        //
        $scope.switchVS = function(vsName) {
            // Apply Visual Style
            $scope.cy.style().fromJson($scope.visualStyles[vsName].style).update();
            // Set current title
            $scope.currentVS = vsName;
        };/////////////////New content. Old content commented out below
	
        /**
        // Apply Visual Style
        //
        $scope.switchVS = function() {
            var vsName = $scope.style;
            var vs = $scope.visualStyles[vsName].style;
            // Apply Visual Style
            $scope.cy.style().fromJson(vs).update();
            // Set current title
            $scope.currentVS = vsName;
        };

        $scope.switchNetwork = function() {
            var network = $scope.networks[$scope.currentNetworkData];//changed to include currentNetworkData as opposed to only currentNetwork
            $scope.cy.load(network.elements);
            $scope.currentNetworkData = network;
            reset();
            $scope.nodes = network.elements.nodes;
            $scope.edges = network.elements.edges;
            setColumnNames();
        };**/
	
	$http({method: 'GET', url: visualStyleFile}).
            success(function(data) {
                vs = data;
                $http({method: 'GET', url: NETWORK_FILE}).
                    success(function(data) {
                        networkData = data;
                        $('#network').cytoscape(options);
                        init();
                    }).
                    error(function(data, status, headers, config) {
                    });
            }).
            error(function(data, status, headers, config) {
            });

	function init() {
            $scope.nodes = networkData.elements.nodes;
            initVisualStyleCombobox();
            // Set network name
            var networkName = networkData.data.name;
            $scope.currentNetworkData = networkData.data.name;//changed to include currentNetworkData as opposed to only currentNetwork
            $scope.networks[networkName] = networkData;
            $scope.networkNames.push(networkName);
        }

        function initVisualStyleCombobox() {
            var styleNames = [];
            for (var i = 0; i < vs.length; i++) {
                var visualStyle = vs[i];
                var title = visualStyle.title;
                styleNames[i] = title;
                $scope.visualStyles[title] = visualStyle;
                $scope.styleNames[i] = title;
            }
        }
	
        /* Start loading...
        var networkData = null;
        if (!gistId) {
            networkData = Network.get({
                    networkUrl: NETWORK_FILE
                },
                function() {
                    angular.element(NETWORK_SECTION_ID).cytoscape(options);
                    $scope.currentNetworkData = networkData;
                },
                function(response) {
                    //404 or bad
                    if (response.status === 404) {
                        $window.alert('File does n..WHAAT?!');
                        $location.path('/');
                    }
                });

        } else {
            // This is a gist file.
            Gist.get({
                gistId: gistId
            }, function(gistData) {
                var files = gistData.files;

                // TODO: parse first one only?

                _.each(files, function(targetFile) {
                    var fileName = targetFile.filename;
                    console.log('File name = ' + fileName);
                    if (fileName === GIST_STYLE_FILE_NAME) {
                        gistStyle = JSON.parse(targetFile.content);
                    } else {
                        var net = JSON.parse(targetFile.content);
                        var netName = net.data.name;
                        $scope.networks[netName] = net;
                        $scope.networkNames.push(netName);
                        $scope.currentNetwork = netName;
                    }
                });
                networkData = $scope.networks[$scope.networkNames[0]];
                $scope.currentNetworkData = networkData;
                angular.element(NETWORK_SECTION_ID).cytoscape(options);
            }, function(response) {
                //404 or bad
                if (response.status === 404) {
                    $window.alert('Could not find Gist!');
                    $location.path('/');
                }
            });
        }*/
    });
