angular.module('foundation.tabs', []);

angular.module('foundation.tabs')
  .controller('FaTabsController', ['$scope', function FaTabsController($scope) {
    var controller = this;
    var tabs = controller.tabs = $scope.tabs = [];

    controller.addTab = function addTab(tabScope) {
      tabs.push({ scope: tabScope});

      if(tabs.length === 1) {
        tabs[0].active = true;
        tabScope.active = true;
      }
    };
}]);

/* Foundation Tabs
 * creates a tabs collection and displays header tabs
 *
 */
angular.module('foundation.tabs')
  .directive('faTabs', ['FoundationApi', function(foundationApi) {
  return {
    restrict: 'EA',
    transclude: 'true',
    replace: true,
    templateUrl: '/partials/tabs.html',
    controller: 'FaTabsController',
    compile: function(tElement, tAttr) {
      if (!tAttr.id) {
        tAttr.$set('id', foundationApi.generateUuid());
      }
      return {
        pre: function preLink(scope, element, attrs) {
        },
        post: function postLink(scope, element, attrs) {
          var id = attrs.id;

          //update tabs in case tab-content doesn't have them
          var updateTabs = foundationApi.publish(id, scope.tabs);

          foundationApi.subscribe(id + '-get-tabs', function() {
            updateTabs();
          });
        }
      };
    }
  };
}]);

/* uses Tab collection to display tabs and activates them when needed */
angular.module('foundation.tabs')
  .directive('faTabContent', ['FoundationApi', function(foundationApi) {
  return {
    restrict: 'A',
    transclude: 'true',
    replace: true,
    scope: {
      tabs: '=?',
      target: '@'
    },
    templateUrl: 'partials/tab-content.html',
    compile: function(tElement, tAttr) {
      return {
        post: function postLink(scope, element, attrs, ctrl) {
          scope.tabs = scope.tabs || [];
          var id = scope.target;


          foundationApi.subscribe(id + '-tabs-active', function(activeTab) {
            angular.forEach(scope.tabs, function(tab) {
              if(activeTab === tab.id) {
                tab.active = true;
              } else {
                tab.active = false;
              }
            });
          });

          //if tabs empty, request tabs
          if(scope.tabs === []) {
            foundationApi.subscribe(id + '-tabs', function(tabs) {
              scope.tabs = tabs;
            });

            foundationApi.publish(id + '-get-tabs', '');
          }
        }
      };
    }
  };
}]);

angular.module('foundation.tabs')
  .directive('faTab', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'EA',
      templateUrl: '/partials/tab.html',
      replace: false,
      transclude: true,
      scope: {
        title: '@'
      },
      controller: function() { },
      require: '^faTabs',
      replace: true,
      compile: function(tElement, tAttr) {

        return {
          post: function postLink(scope, element, attrs, controller, transclude) {
            scope.id = attrs.id || foundationApi.generateUuid();
            scope.active = false;
            scope.transcludeFn = transclude;
            controller.addTab(scope);

          }
        };
      }
    };
}]);

angular.module('foundation.tabs')
  .directive('faTabIndividual', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'A',
      transclude: 'true',
      replace: false,
      link: function postLink(scope, element, attrs, ctrl, transclude) {
        var tab = scope.$eval(attrs.tab);

        tab.scope.transcludeFn(tab.$parent, function(tabContent) {
          element.append(tabContent);
        });
      }
    };
}]);

angular.module('foundation.tabs')
  .directive('faTabHref', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'A',
      replace: false,
      link: function postLink(scope, element, attrs, ctrl) {
      }
    };
}]);
