angular.module('app.controllers', ["pubnub.angular.service"])

.controller('favouriteCtrl', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPlatform) {
          $rootScope.extras=true;
          var vm = this;
          vm.scan = function(){
              $ionicPlatform.ready(function() {
                  $cordovaBarcodeScanner
                      .scan()
                      .then(function(result) {
                          // Success! Barcode data is here
                          vm.scanResults = "We got a barcode\n" +
                          "Result: " + result.text + "\n" +
                          "Format: " + result.format + "\n" +
                          "Cancelled: " + result.cancelled;
                      }, function(error) {
                          // An error occurred
                          vm.scanResults = 'Error: ' + error;
                      });
              });
          };
     vm.scanResults = '';
})

.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false;
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true);
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('menu2', {}, {location: "replace"});
      }
    });

    $scope.loginEmail = function(formName,cred) {
      if(formName.$valid) {
          sharedUtils.showLoading();

          //Email
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {
              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('menu2', {}, {location: "replace"});
            },
            function(error) {
              sharedUtils.hideLoading();
              sharedUtils.showAlert("Please note","Authentication Error");
            }
        );
      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }
    };
})

.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,$state,fireBaseData,$ionicHistory) {
    $rootScope.extras = false;
    $scope.signupEmail = function (formName, cred) {
      if (formName.$valid) {
        sharedUtils.showLoading();
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

            fireBaseData.refUser().child(result.uid).set({
              telephone: cred.phone
            });

            //Registered OK
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });

            $ionicSideMenuDelegate.canDragContent(true);
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});
        }, function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Please note","Sign up Error");
        });
      }else{
        sharedUtils.showAlert("Please note","Entered data is not valid");
      }
    }
  })

.controller('menu2Ctrl', function($scope,$rootScope,$ionicSideMenuDelegate,fireBaseData,$state,$ionicHistory,$firebaseArray,sharedCartService,sharedUtils) {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user;
    }else {
      $ionicSideMenuDelegate.toggleLeft();
      $ionicSideMenuDelegate.canDragContent(false);
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});
    }
  });

  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;

  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });

  $scope.loadMenu = function() {
    sharedUtils.showLoading();
    $scope.menu=$firebaseArray(fireBaseData.refMenu());
    sharedUtils.hideLoading();
  }
  $scope.showProductInfo=function (id) {
  };
  $scope.addToCart=function(item){
    sharedCartService.add(item);
  };
})

.controller('indexCtrl', function($scope,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService) {
    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user;
        $scope.get_total= function() {
          var total_qty=0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            total_qty += sharedCartService.cart_items[i].item_qty;
          }
          return total_qty;
        };
      }else {
        $ionicSideMenuDelegate.toggleLeft();
        $ionicSideMenuDelegate.canDragContent(false);
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});
      }
    });

    $scope.logout=function(){
      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function() {
        $ionicSideMenuDelegate.toggleLeft();
        $ionicSideMenuDelegate.canDragContent(false);
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});
      }, function(error) {
         sharedUtils.showAlert("Error","Logout Failed")
      });
    }
  })

.controller('myCartCtrl', function($scope,$rootScope,$state,sharedCartService) {
    $rootScope.extras=true;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.cart=sharedCartService.cart_items;
        $scope.get_qty = function() {
          $scope.total_qty=0;
          $scope.total_amount=0;
          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
          }
          return $scope.total_qty;
        };
      }
    });

    $scope.removeFromCart=function(c_id){
      sharedCartService.drop(c_id);
    };

    $scope.inc=function(c_id){
      sharedCartService.increment(c_id);
    };

    $scope.dec=function(c_id){
      sharedCartService.decrement(c_id);
    };

    $scope.checkout=function(){
      $state.go('checkout', {}, {location: "replace"});
    };
})

.controller('lastOrdersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils) {
    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;
        fireBaseData.refOrder()
          .orderByChild('user_id')
          .startAt($scope.user_info.uid).endAt($scope.user_info.uid)
          .once('value', function (snapshot) {
            $scope.orders = snapshot.val();
            $scope.$apply();
          });
          sharedUtils.hideLoading();
      }
    });
})

.controller('settingsCtrl', function($scope,$rootScope,fireBaseData,$firebaseObject,$ionicPopup,$state,$window,$firebaseArray,sharedUtils,Pubnub) {
    $rootScope.extras=true;
    sharedUtils.showLoading();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.addresses= $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));
        $scope.user_info=user;
        $scope.data_editable={};
        $scope.data_editable.email=$scope.user_info.email;
        $scope.data_editable.password="";
        $scope.$apply();
        sharedUtils.hideLoading();

        //$scope.theText = "Our drug";
        //window.speechSynthesis.speak(new SpeechSynthesisUtterance($scope.theText));
      }
    });

    $scope.addManipulation = function(edit_val) {
      if(edit_val!=null) {
        $scope.data = edit_val;
        var title="Edit Address";
        var sub_title="Edit your address";
      }
      else {
        $scope.data = {};
        var title="Add Address";
        var sub_title="Add your new address";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"   placeholder="Nick Name"  ng-model="data.nickname"> <br/> ' +
                  '<input type="text"   placeholder="Address" ng-model="data.address"> <br/> ' +
                  '<input type="number" placeholder="Pincode" ng-model="data.pin"> <br/> ' +
                  '<input type="number" placeholder="Phone" ng-model="data.phone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Close' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.nickname || !$scope.data.address || !$scope.data.pin || !$scope.data.phone ) {
                e.preventDefault();
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {
        if(edit_val!=null) {
          //Update  address
          if(res!=null){
            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({
              nickname: res.nickname,
              address: res.address,
              pin: res.pin,
              phone: res.phone
            });
          }
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({
            nickname: res.nickname,
            address: res.address,
            pin: res.pin,
            phone: res.phone
          });
        }
      });
    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function(del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Address',
        template: 'Are you sure you want to delete this address',
        buttons: [
          { text: 'No' , type: 'button-stable' },
          { text: 'Yes', type: 'button-assertive' , onTap: function(){return del_id;} }
        ]
      });

      confirmPopup.then(function(res) {
        if(res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save= function (extras,editable) {
      if(extras.telephone!="" && extras.telephone!=null ){
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({
          telephone: extras.telephone
        });
      }

      //Edit Password
      if(editable.password!="" && editable.password!=null  ){
        firebase.auth().currentUser.updatePassword(editable.password).then(function(ok) {}, function(error) {});
        sharedUtils.showAlert("Account","Password Updated");
      }

      //Edit Email
      if(editable.email!="" && editable.email!=null  && editable.email!=$scope.user_info.email){
        firebase.auth().currentUser.updateEmail(editable.email).then(function(ok) {
          $window.location.reload(true);
        }, function(error) {
          sharedUtils.showAlert("ERROR",error);
        });
      }
    };

    $scope.cancel=function(){
      $window.location.reload(true);
      console.log("CANCEL");
    }
})

.controller('supportCtrl', function($scope,$rootScope) {
    $rootScope.extras=true;
})

//OCR
.controller('CaptureCtrl', function($scope, $rootScope, $ionicActionSheet, $ionicLoading, $ionicPlatform, $cordovaCamera) {

  $rootScope.extras=true;

  $ionicPlatform.ready(function() {

  $scope.showAnalyzeButton = false;

    var self = this;

    this.showLoading = function() {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner>'
      });
    };

    this.hideLoading = function(){
      $ionicLoading.hide();
    };

    this.getPicture = function(index){

      var sourceType = index === 0 ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA;
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: sourceType,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
        var image = document.getElementById('pic');
        image.src = "data:image/jpeg;base64," + imageData;
        $scope.showAnalyzeButton = true;
      }, function(err) {
          console.log(err);
      });

    };

  });

  $scope.showActionSheet = function(){
    var hideSheet = $ionicActionSheet.show({
      buttons: [
       { text: 'Choose Photo' },
       { text: 'Take Photo' }
      ],
      cancelText: 'Cancel',
      cancel: function() {
        console.log('cancel');
      },
      buttonClicked: function(index) {
        getPicture(index);
       return true;
      }
    });
  };

  $scope.showActionSheet();

  $scope.testOcrad = function(){
    self.showLoading();
    OCRAD(document.getElementById("pic"), function(text){
      self.hideLoading();
      console.log(text);
      alert(text);
    });
  } ;

});

