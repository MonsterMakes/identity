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
            userPoolClientId: '362hm9nhif3p9gkebfnfsstkvu',
            region: 'us-west-2'
        },
        api: {
            apiRootUrl: 'https://0kq9lpqrl8.execute-api.us-west-2.amazonaws.com/beta'
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
            _escapeKeyPressedEventListener: (function(event){
                if (event.key === 'Escape' || event.keyCode === 27) {
                    this._destroyFeedback();
                }
            }).bind(this),
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
                    this._modalKeyListener = (function(){
                        this._destroyFeedback();
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
        let pool = new this._classes.CognitoUserPool(null,this._config.cognito);
        return this._globalState._userPool.signIn(email,password)
            .then(()=>{
                this._globalState._userPool = pool;
            });
    },
    /**
     * Global signout method
     */
    signOut: function signOut() {
        let pool = this.getSessionUserPool();
        return Promise.resolve()
            .then(()=>{
                return pool.signOut();
            });
    },
    getSessionUserPool: function(){
        if(this._globalState._userPool){
            return this._globalState._userPool;
        }
        else{
            let userPool = new this._classes.CognitoUserPool(null,this._config.cognito);
            let user = userPool.getCurrentUser();
            if(user){
                this._globalState._userPool = userPool;
            }
            return userPool;
        }
    },
    /**
     * Redirect the user to the login page if they are not logged in.
     */
    verifyAuthenticatedUser: function(){
        let userPool = this.getSessionUserPool();
        return userPool.isCurrentUserSessionValid()
            .catch((e)=>{
                window.location.href = "/login.html";    
                return Promise.reject(e);
            });
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