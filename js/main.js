"use strict";

import CognitoUserPool from './classes/CognitoUserPool.js';

window.Larry = {
    _config:{
        app: {
            loginUrl: '/login.html',
            logoutUrl: '/logout.html'
        },
        cognito: {
            userPoolId: 'us-west-2_lYLXxamUc', 
            userPoolWebClientId: '362hm9nhif3p9gkebfnfsstkvu',
            region: 'us-west-2',
            oauth:{
                domain: "oauth.web.sso.auctionfrontierdevelopment.com",
                scope: ["email","openid","aws.cognito.signin.user.admin","profile"],
                redirectSignIn: "https://web.sso.auctionfrontierdevelopment.com/landing.html",
                redirectSignOut: "https://web.sso.auctionfrontierdevelopment.com/logout.html",
                responseType: "token"
            }
        },
        api: {
            apiRootUrl: 'https://api.sso.auctionfrontierdevelopment.com/'
        }
    },
    _classes: {
        CognitoUserPool
    },
    _globalState:{
        _userPool: undefined,
        _authenticatedUser: undefined
    },
    ui:{
        userFeedback: {
            _escapeKeyPressedEventListener: function(event){
                if (event.key === 'Escape' || event.keyCode === 27) {
                    this._destroyFeedback();
                }
            },
            _destroyFeedback: function(){
                let existingModalElem = document.querySelector(".modal-userfeedback");
                if(existingModalElem){
                    existingModalElem.remove();
                }
                this._modalDisplayed = false;
                document.body.removeEventListener("keydown",this._modalKeyListener);
                this._modalKeyListener = null;
            },
            _createFeedbackContainer: function(){
                let userfeedbackElem = document.createElement('div');
                userfeedbackElem.classList.add("modal-userfeedback");
                
                return userfeedbackElem;
            },
            hideMessage: function(){
              this._destroyFeedback();  
            },
            displayMessage: function(title,contents,opts){
                let userfeedbackElem = this._createFeedbackContainer();
                userfeedbackElem.innerHTML=`
                    <h1>${title}</h1>
                    <div class="modal-userfeedback-contents">
                    </div>
                `;
                let contentsElem = userfeedbackElem.querySelector('.modal-userfeedback-contents');
                contentsElem.innerHTML = contents;
                
                if(this._modalDisplayed){
                    this._destroyFeedback();    
                }
                else{
                    this._modalDisplayed = true;
                    this._modalKeyListener = (function(event){
                        this._escapeKeyPressedEventListener(event);
                    }).bind(this);
                    
                    document.body.addEventListener("keydown",this._modalKeyListener);
                }
                if(opts && opts.error){
                    userfeedbackElem.classList.add("error");
                }
                document.body.appendChild(userfeedbackElem);
            },
            displayErrorMessage: function(title,contents){
                return this.displayMessage(title,contents,{error:true});
            }
        }  
    },
    /********************************************************/
    /* START GLOBAL METHODS */
    /********************************************************/
    /**
     * Global signin method
     */
    signIn: function signIn(email, password){
        //TODO check if the user is already logged in
        let pool = new this._classes.CognitoUserPool(this._config.cognito);
        return this._globalState._userPool.signIn(email,password)
            .then(()=>{
                this._globalState._userPool = pool;
            });
    },
    /**
     * Global signout method
     */
    signOut: function signOut() {
        let pool = this.getCognitoUserPool();
        return Promise.resolve()
            .then(()=>{
                return pool.signOut();
            });
    },
    getCognitoUserPool: function(){
        if(this._globalState._userPool){
            return this._globalState._userPool;
        }
        else{
            let userPool = new this._classes.CognitoUserPool(this._config.cognito);
            userPool.getCurrentUser()
                .then((user)=>{
                    if(user){
                        this._globalState._userPool = userPool;
                    }
                })
                .catch(()=>{/*do nothing*/});
            
            return userPool;
        }
    },
    /**
     * Redirect the user to the login page if they are not logged in.
     */
    verifyAuthenticatedUser: function(){
        let userPool = this.getCognitoUserPool();
        return userPool.isCurrentUserSessionValid()
            .catch((e)=>{
                window.location.href = "/login.html";    
                return Promise.reject(e);
            });
    },
    /**
     * @returns {Promise<jwt>} Returns a Promise that is resolved with a jwt token if valid session or null otherwise.
     */
    retrieveIdToken: function(){
        let userPool = this.getCognitoUserPool();
        return userPool.retrieveIdToken();
    }
    /********************************************************/
    /* END GLOBAL METHODS */
    /********************************************************/
}