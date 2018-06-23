"use strict";

const Amplify = window["aws-amplify"].API;
const AmplifyAuth = window["aws-amplify"].AuthClass;

/**
 * TODO - global sign out
 * TODO - update user attributes
 * TODO - change password
 * TODO - forgot password
 */
class CognitoUserPool{
    constructor(config={}){
        //setup cognito
        this._auth = new AmplifyAuth(config);
    }
   
    /**
     * Register a new user in the pool
     */
    register(username, password, userAttributes) {
        //TODO add error handling when user/pass not specified

        return  this._auth.signUp({
            username, 
            password, 
            attributes: userAttributes
        });
    }
    
    /**
     * Confirm the newly registered user in the pool, via the code provided from the email
     */
    confirmRegistration(username,code){
        // Collect confirmation code, then
        return  this._auth.confirmSignUp(username, code, {
            // Optional. Force user confirmation irrespective of existing alias. By default set to True.
            forceAliasCreation: true    
        });
    }

    /**
     * Sign the user in 
     */
    signIn(username, password) {
        return this._auth.signIn(username,password);
    }

    /**
     * If MFA is enabled call this to provide the challenge
     */
    confirmSignIn(user,code,mfaType){
        // If MFA is enabled, confirm user signing 
        // `user` : Return object from Auth.signIn()
        // `code` : Confirmation code  
        // `mfaType` : MFA Type e.g. SMS, TOTP.
        return this._auth.confirmSignIn(user, code, mfaType)
    }

    /**
     * Sign out of the userpool "application"
     */
    signOut(){
        return this._auth.signOut();
    }

    /**
     * Get the current user of this pool
     */
    getCurrentUser(){
         return this._auth.currentUserPoolUser();
    }
    /**
     * @returns {CognitoUserSession} - The User session contianing the tokens
     */
    getCurrentUserSession(){
        return this._auth.currentSession();
    }
    isCurrentUserSessionValid(){
        return this.getCurrentUserSession()
            .then((session)=>{
                if (session.isValid()) {
                    return Promise.resolve();
                }
                else{
                    return Promise.reject();
                }
            });
    }

    retrieveIdToken(){
        return this.getCurrentUserSession()
            .then((session)=>{
                if (!session.isValid()) {
                    return Promise.resolve(null);
                } else {
                    return Promise.resolve(session.getIdToken());
                }
            });
    }
    retrieveAccessToken(){
        return this.getCurrentUserSession()
            .then((session)=>{
                if (!session.isValid()) {
                    return Promise.resolve(null);
                } else {
                    return Promise.resolve(session.getAccessToken());
                }
            });
    }
    retrieveRefreshToken(){
        return this.getCurrentUserSession()
            .then((session)=>{
                if (!session.isValid()) {
                    return Promise.resolve(null);
                } else {
                    return Promise.resolve(session.getRefreshToken());
                }
            });
    }
}
export default CognitoUserPool;