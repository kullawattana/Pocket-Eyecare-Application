// Ionic Starter App
angular.module('app', ['ionic',   'ngCordova',
                                  'ionic.service.core',
                                  'ionic.service.push',
                                  'ionic.service.deploy',
                                  'app.controllers',
                                  'app.routes',
                                  'app.services',
                                  'app.directives',
                                  'firebase'])

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.tabs.position('bottom');
})

.run(function($ionicPlatform,$rootScope) {
      $rootScope.extras = false;
      $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      // Color the iOS status bar text to white
        if (window.StatusBar) {
          $cordovaStatusbar.overlaysWebView(true);
          $cordovaStatusBar.style(1); //Light
        }

        // Default update checking
        $rootScope.updateOptions = {
          interval: 2 * 60 * 1000
        };

        // Watch Ionic Deploy service for new code
        $ionicDeploy.watch($rootScope.updateOptions).then(function() {}, function() {}, function(hasUpdate) {
          $rootScope.lastChecked = new Date();
          console.log('WATCH RESULT', hasUpdate);
        });

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
  });
})

//QR Code
.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'YOUR_APP_ID',
    // The public API key all services will use for this app
    api_key: 'YOUR_API_KEY',
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
    //gcm_id: 'GCM_ID',
  });
}])
