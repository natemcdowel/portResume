'use strict';
// CONTROLLERS ///////////////////
/*
	- Handles the overall data structure for the site
*/
var portfolioControllers = angular.module('Portfolio.controllers', []);

// Main grid controller
/*
	This root controller handles all the main data for the site (from the json file),
	router state switching (/project/name), and grid layout.
*/
portfolioControllers.controller('GridCtrl',
['$rootScope', '$scope', '$state', '$stateParams', 'data', 'Helpers',
function($rootScope, $scope, $state, $stateParams, data, Helpers) {
	// set overall scope vars
	$scope.projects = data.projects;	// all project data
	$scope.projectDetails = {			// used to store the currently selected project's data 
		projectId: null
	};
	$scope.grid = {
		projectsPerRow: 0,
		rows: []
	};
	$scope.about = {
		active: false,
		data: data.about
	};
	$scope.templates = {
		about: '/views/about.html',
		item: '/views/item.html'
	};

	// assign class for grid (one-up, two-up, three-up, etc)
	$scope.gridClass = function(projectsPerRow) {
		return Helpers.convert.numToString(projectsPerRow)+'-up';
	};

	// handle project url route changes
	$scope.$on('$stateChangeSuccess', function(e, toState, toParams) { //, fromState, fromParams
		e.preventDefault();
		var i;
		// find the correct project if user has routed to one
		if(toState.name === 'index.project' && $scope.projectsPerRow !== 0) {
			for(i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) { $scope.projects[i].selected = false; }
				if($scope.projects[i].id === toParams.id) {
					$scope.projectDetails = $scope.projects[i];
					$scope.projects[i].selected = true;
					Helpers.setTitle('Nathan McDowell | Portfolio | '+$scope.projectDetails.title);
				}
			}
		} else if(toState.name === 'index.grid') {
			for(i=0; i<$scope.projects.length; i++) {
				if($scope.projects[i].selected) { $scope.projects[i].selected = false; }
			}
			$scope.projectDetails = null;
			Helpers.setTitle('Nathan McDowell | Portfolio');
		}
	});
}]);

// Grid item controller
/*
	This controller handles each individual item within the grid.
	Handles things like pausing, selecting, hovering
*/
portfolioControllers.controller('ItemCtrl',
['$scope', 'WindowFocus', function($scope, WindowFocus) {
	// user is hovering over this project block
	$scope.onMouseOver = function() {
		$scope.project.cube.pause = true;
	};
	$scope.onMouseOut = function() {
		if(!$scope.project.selected) { $scope.project.cube.pause = false; }
	};

	// watch project select/deselect
	$scope.$watch(function(){ return $scope.project.selected; }, function(newVal, oldVal){
		if(newVal === oldVal) { return; }
		if(newVal) {
			$scope.project.cube.pause = true;
		} else {
			$scope.project.cube.pause = false;
		}
	});

	// pause all cubes when user has left the window/tab (causes issues with transitions etc)
	$scope.$watch(WindowFocus.get, function(newVal, oldVal) {
		if(newVal === oldVal) { return; }
		if(newVal) {
			$scope.project.cube.pause = false;
		} else {
			$scope.project.cube.pause = true;
		}
	});
}]);

// Cube controller
/*
	This controller handles setting cube data for each grid item
*/
portfolioControllers.controller('CubeCtrl',
['$scope', 'Helpers', function($scope, Helpers) {
	// set cube data if it exists
	var cube = $scope.project.cube,
		index, nextIndex,  // index & next index of the project image that should be displayed
		firstLoad;		   // used for the initial stagger load-in animation for all items
	if(cube) {
		// cube data already exists (can happen when user resizes the grid for example)
		index     = cube.index;
		nextIndex = cube.nextIndex;
		firstLoad = cube.firstLoad;
	} else {
		// no cube data already exists, this will be the initial cube
		index = Math.floor(Math.random()*$scope.project.images.length);
		if(index === $scope.project.images.length - 1) { nextIndex = 0;
		} else { nextIndex = index + 1; }
		firstLoad = false;
	}
	// set cube
	$scope.project.cube = {
		index                : index,			// used for tracking the current image
		nextIndex            : nextIndex,		// used for tracking the next image in queue
		transitionSpeed      : 0.7,				// time it takes the cube to rotate
		sidesLoaded          : 0,				// used for knowing when both sides of the cube are loaded
		firstLoad            : firstLoad,		// initial load of the first cube side (site load init)
		sideArchive          : [],				// used for storing sides that have already been loaded for less network calls
		transition           : false,			// cube is in transition
		transitionComplete   : false,			// cube has completed transition
		pause                : $scope.project.selected ? true : false,
		transitionWaitTimer  : null,			// random ammount of time the cube waits before animating to the next side
		transitionTimer      : null,			// full timer that includes the random wait delay above ^,
		direction            : Helpers.getRandomDirection()
	};
}]);