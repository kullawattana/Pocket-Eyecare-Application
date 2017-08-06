angular.module('app.services', [])
.factory('fireBaseData', function($firebase) {
	var ref = new Firebase("https://foodkart-7c149.firebaseio.com/"),
    refCart = new Firebase("https://foodkart-7c149.firebaseio.com/cart"),
    refUser = new Firebase("https://foodkart-7c149.firebaseio.com/users"),
    refCategory = new Firebase("https://foodkart-7c149.firebaseio.com/category"),
    refOrder = new Firebase("https://foodkart-7c149.firebaseio.com/orders"),
    refFeatured = new Firebase("https://foodkart-7c149.firebaseio.com/featured"),
    refMenu = new Firebase("https://foodkart-7c149.firebaseio.com/menu");
  return {
    ref: function() {
      return ref;
    },
    refCart: function() {
      return refCart;
    },
    refUser: function() {
      return refUser;
    },
    refCategory: function() {
      return refCategory;
    },
    refOrder: function() {
      return refOrder;
    },
    refFeatured: function() {
      return refFeatured;
    },
    refMenu: function() {
      return refMenu;
    }
  }
})

//LOADING
.factory('sharedUtils',['$ionicLoading','$ionicPopup', function($ionicLoading,$ionicPopup){
    var functionObj={};
    functionObj.showLoading=function(){
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    };
    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };

    functionObj.showAlert = function(title,message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
    };
    return functionObj;
}])

//fireBaseData.refCart().child(uid) คือ การเข้าถึงข้อมูลใน Firebase ด้วย uid=user.uid;

//POPUP
.factory('sharedCartService', ['$ionicPopup','fireBaseData','$firebaseArray',function($ionicPopup, fireBaseData, $firebaseArray){
    var uid ;       //USER ID
    var cart={};
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        uid=user.uid;
        cart.cart_items = $firebaseArray(fireBaseData.refCart().child(uid));
      }
});

//Add to Cart
cart.add = function(item) {
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {

        //UPDATE
        if( snapshot.hasChild(item.$id) == true ){
          var currentQty = snapshot.child(item.$id).val().item_qty;
          fireBaseData.refCart().child(uid).child(item.$id).update({
            item_qty : currentQty+1
          });
        }else{

          //ADD
          fireBaseData.refCart().child(uid).child(item.$id).set({
            item_name: item.name,
            item_image: item.image,
            item_price: item.price,
            item_qty: 1
          });
        }
      });
    };

    //REMOVE
    cart.drop=function(item_id){
      fireBaseData.refCart().child(uid).child(item_id).remove();
    };

    //UPDATE
    cart.increment=function(item_id){
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){
          var currentQty = snapshot.child(item_id).val().item_qty;
          fireBaseData.refCart().child(uid).child(item_id).update({
            item_qty : currentQty+1
          });
        }else{
          //pop error
        }
      });
    };

    cart.decrement=function(item_id){
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){

          //ตรวจสอบ
          var currentQty = snapshot.child(item_id).val().item_qty;
          if( currentQty-1 <= 0){
            cart.drop(item_id);           //เรียก Drop ID นั้น
          }else{

            //UPDATE
            fireBaseData.refCart().child(uid).child(item_id).update({
              item_qty : currentQty-1
            });
          }
        }else{
          //pop error
        }
      });
    };
    return cart;
  }])

.factory('BlankFactory', [function(){}])
.service('BlankService', [function(){}]);


