angular.module('app.releases', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/releases/:channel?', {
        templateUrl: 'js/download/download.html',
        controller: 'DownloadController as vm'
      });
  }])
  .controller('DownloadController', [
    '$scope', '$routeParams', '$route', 'PubSub', 'deviceDetector',
    'DataService',
    '$sce',
    function(
      $scope, $routeParams, $route, PubSub, deviceDetector, DataService, $sce
    ) {
      var self = this;

      self.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      }

      self.showAllVersions = false;

      self.platform = deviceDetector.os;
      if (self.platform === 'mac') {
        self.platform = 'osx';
        self.archs = ['64'];
      } else {
        self.archs = ['32', '64'];
      }

      self.setChannelParams = function(channel) {
        $route.updateParams({
          channel: channel
        });

        return channel;
      };

      self.availablePlatforms = DataService.availablePlatforms;
      self.filetypes = DataService.filetypes;
      self.availableChannels = DataService.availableChannels;

      // Get selected channel from route or set to default (stable)
      self.channel = $routeParams.channel || self.setChannelParams(
        self.availableChannels[0]
      );

      self.latestReleases = null;
      self.downloadUrl = null;

      self.getLatestReleases = function() {
        self.setChannelParams(self.channel);
        self.latestReleases = DataService.getLatestReleases(
          self.platform,
          self.archs,
          self.channel
        );
        self.versions = DataService.data;
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        // $scope.$apply(function() {
        self.getLatestReleases();
        // });
      });

      // Update knowledge of the latest available versions.
      self.getLatestReleases();

      self.download = function(asset, versionName) {
        if (!asset) {
          return;
        }

        self.downloadUrl = asset.fd;
      };

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
