"use strict";
/*global AWSCognito*/
/*global AmazonCognitoIdentity*/

class CognitoUserPool{
    constructor(userpool=undefined,config={}){
        if(userpool){
            this._userPool = this._userPool;
        }
        else{
            //setup cognito
            AWSCognito.config.region = config.region;
            this._userPool = new AmazonCognitoIdentity.CognitoUserPool({
                UserPoolId: config.userPoolId,
                ClientId: config.userPoolClientId
            });
        }
    }
    _getCognitoUserAttributes(userAttributesObj){
        let attributeList = [];
        
        Object.keys(userAttributesObj).forEach((key)=>{
            let attr = {
                Name: key,
                Value: userAttributesObj[key]
            };
            let cognitoAttr = new AmazonCognitoIdentity.CognitoUserAttribute(attr);
            attributeList.push(cognitoAttr);
        });
        return attributeList;
    }
    /*
     * Cognito User Pool functions
     */
    register(username, password, userAttributes) {
        //TODO add error handling when user/pass not specified
        let cognitoUserAttributes = this._getCognitoUserAttributes(userAttributes);

        return new Promise((resolve,reject)=>{
            this._userPool.signUp(username, password, cognitoUserAttributes, null,
                (err, result)=>{
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    signin(username, password) {
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: this._userPool
        });

        return new Promise((resolve,reject)=>{
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: resolve,
                onFailure: reject
            });
        });
    }

    verify(username, code) {
        return new Promise((resolve,reject)=>{
            let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
                Username: username,
                Pool: this._userPool
            });
            
            cognitoUser.confirmRegistration(code, true, (err, result)=>{
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            });    
        })
        
    }
    /**
     * Get the current user of this pool
     */
    getCurrentUser(){
         return this._userPool.getCurrentUser();
    }
    /**
     * RetrieveAuthToken
     * @returns {Promise<jwt>} Returns a Promise that is resolved with a jwt token if valid session or null otehrwise.
     */
    retrieveAuthToken(){
        return new Promise((resolve, reject)=>{
            var cognitoUser = this._userPool.getCurrentUser();
        
            if (cognitoUser) {
                cognitoUser.getSession((err, session)=>{
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
}
export default CognitoUserPool;