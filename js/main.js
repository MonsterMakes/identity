"use strict";
/*global AWSCognito*/
/*global AmazonCognitoIdentity*/
import CognitoUserPool from './classes/CognitoUserPool.js';

window.Larry = {
    _config:{
        app: {
            loginUrl: '/login.html',
            logoutUrl: '/logout.html'
        },
        cognito: {
            userPoolId: 'us-west-2_lYLXxamUc', 
            userPoolClientId: '362hm9nhif3p9gkebfnfsstkvu',
            region: 'us-west-2'
        },
        api: {
            invokeUrl: '' // e.g. https://rc7nyt4tql.execute-api.us-west-2.amazonaws.com/prod',
        }
    },
    _classes: {
        CognitoUserPool
    },
    _globalState:{
        _userPool: undefined,
        _authenticatedUser: undefined
    },
    /********************************************************/
    /* START GLOBAL METHODS */
    /********************************************************/
    /**
     * Starts up the application
     */
    start: function start(){
        
    },
    /**
     * Global signin method
     */
    signIn: function signIn(email, password){
        //TODO check if the user is already logged in
        this._globalState._userPool = new this._classes.CognitoUserPool(null,this._config.cognito);
        return this._globalState._userPool.signin(email,password);
    },
    /**
     * Global signout method
     */
     signOut: function signOut() {
        this._globalState._userPool.getCurrentUser().signOut();
    },
    /**
     * RetrieveAuthToken
     * @returns {Promise<jwt>} Returns a Promise that is resolved with a jwt token if valid session or null otehrwise.
     */
    retrieveAuthToken: function(){
        return new Promise(function fetchCurrentAuthToken(resolve, reject) {
            var cognitoUser = this._globalState._userPool.getCurrentUser();
        
            if (cognitoUser) {
                cognitoUser.getSession(function sessionCallback(err, session) {
                    if (err) {
                        reject(err);
                    } else if (!session.isValid()) {
                        resolve(null);
                    } else {
                        resolve(session.getIdToken().getJwtToken());
                    }
                });
            } else {
                resolve(null);
            }
        });
    }
    /********************************************************/
    /* END GLOBAL METHODS */
    /********************************************************/
}