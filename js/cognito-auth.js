"use strict";
/*global Larry*/

/*
 *  Event Handlers
 */
document.querySelector('#registrationForm').submit(handleRegister);
    $('#verifyForm').submit(handleVerify);
});

function handleSignin(event) {
    var email = $('#emailInputSignin').val();
    var password = $('#passwordInputSignin').val();
    event.preventDefault();
    signin(email, password,
        function signinSuccess() {
            console.log('Successfully Logged In');
            window.location.href = 'ride.html';
        },
        function signinError(err) {
            alert(err);
        }
    );
}

function handleVerify(event) {
    var email = $('#emailInputVerify').val();
    var code = $('#codeInputVerify').val();
    event.preventDefault();
    verify(email, code,
        function verifySuccess(result) {
            console.log('call result: ' + result);
            console.log('Successfully verified');
            alert('Verification successful. You will now be redirected to the login page.');
            window.location.href = signinUrl;
        },
        function verifyError(err) {
            alert(err);
        }
    );
}