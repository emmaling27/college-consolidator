// Google Sign-In feature

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
  // })
  //   .fail(function(jqXHR, textStatus, errorThrown) {

  //       // log error to browser's console
  //       console.log(errorThrown.toString());
  //   });

  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());
}