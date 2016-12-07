// Google Sign-In feature
var status;

// Initializes the GoogleAuth object. 
gapi.auth2.init({
  client_id: '426775631492-nauqognl1pgao9gnd6l3hhn53u4lv516.apps.googleusercontent.com'
})




function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  
  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  console.log("ID Token: " + id_token);
  
  // $.ajax({
  //   type: "POST",
  //   url: Flask.url_for("signin"),
  //   data: { param: profile}
  // }).done(function( o ) {
  // // do something
  //   console.log("success")
  // })
  //   .fail(function(jqXHR, textStatus, errorThrown) {

  //       // log error to browser's console
  //       console.log(errorThrown.toString());
  //   });
  status = "signedin"

  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());
  
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
          console.log('User signed out.');
    });
}

if (status === "signin") {
//   document.getElementById("myBtn").addEventListener("click", function(){
//     document.getElementById("demo").innerHTML = "Hello World";
// });
  signOut();
}