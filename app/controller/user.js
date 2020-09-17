let response = require('../lib/responseLib');
let validateInput = require('../lib/paramsValidationLib');
let logger = require('../lib/loggerLib');
let checkLib = require('../lib/checkLib');
let shortid = require('shortid');
let passwordLib = require('../lib/generatePasswordLib');
let tokenLib = require('../lib/tokenLib')

let UserModel = require('../model/user');
let authModel = require('../model/auth');

let apiResponse;

let signUp = (req,res)=>
{
    //validating email and other inputs
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email && req.body.username) {
                if (!validateInput.Email(req.body.email)) {
                    apiResponse = response.generate(true, 'email does not met the requirement', 400, null);
                    logger.error('not valid email', 'signup:validateUserInput', 10)
                    reject(apiResponse)
                }
                else if (checkLib.isEmpty(req.body.password)) {
                    apiResponse = response.generate(true, 'password is empty', 400, null)
                    logger.error('password is empty', 'signup:validateUserInput', 10)
                    reject(apiResponse)
                }
                else {
                    logger.info('user validated', 'signup:validateUserInput', 10);
                    resolve(req);
                }
            }
            else {
                logger.error('one or more parameter is missing', 'signup:signUpFunction', 10);
                apiResponse = response.generate(true, 'one or more parameter is missing', 400, null);
                reject(apiResponse);
            }
        });
    }//end of validate user input

    //creating user after input validation
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'signup: createUser', 10)
                        apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (checkLib.isEmpty(retrievedUserDetails)) {
                        //if no email has been registered yet with provided email,then create new

                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            username: req.body.username,
                            mobile: req.body.mobile,
                            email: req.body.email.toLowerCase(),
                            password: passwordLib.hashPassword(req.body.password),
                            createdOn: Date.now()
                        })
                        newUser.save((err, newUserDetail) => {
                            if (err) {
                                logger.error(err.message, 'signup : createUser', 10)
                                apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                //converting mongoose object to plain javascript object
                                let newUserObj = newUserDetail.toObject();

                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password;
            delete resolve.__v;
            delete resolve._id;
            apiResponse = response.generate(false, 'user created', 200, resolve);
            logger.info('user created','signup : createUser',10)
            res.send(apiResponse);
        })
        .catch((error) => {
            res.send(error)
        })
}

let signIn = (req,res)=>
{
    let validateInputs = ()=>
    {
        return new Promise((resolve,reject)=>
        {
            if(req.body.email && req.body.password)
            {
                resolve(req)
            }
            else
            {
                apiResponse = response.generate(true,'one or more parameter missing',400,null);
                logger.error('one or more parameter missing','signIn : validateInputs',10);
                reject(apiResponse)
            }
        })
    }

    //using promise for finding user,to check if provided email has been registered or not
    let findUser = () => {
        return new Promise((resolve, reject) => {
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                        logger.error(err.message, 'signin:findUser', 10);
                        apiResponse = response.generate(true, 'failed to find user detail', 500, null);
                        reject(apiResponse)
                    }
                    else if (checkLib.isEmpty(userDetails)) {
                        //userdetails is empty so it means that the user with given email is not 
                        //registered yet
                        logger.info('no user found with given email', 'signin:findUser', 7);
                        apiResponse = response.generate(true, 'no user details found', 404, null);
                        reject(apiResponse)
                    }
                    else {
                        logger.info('user found', 'signin:findUser', 10);
                        resolve(userDetails);
                    }
                })
        });//end of promise
    }//end of findUser

    // validate provided password
    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    logger.error(err.message, 'signin:validatePassword', 10);
                    apiResponse = response.generate(true, 'login failed', 500, null);
                    reject(apiResponse);
                }
                else if (isMatch) {
                    //converting mongoose object to normal javascript object 
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;
                    resolve(retrievedUserDetailsObj);
                }
                else {
                    logger.info('login failed due to invalid password', 5);
                    apiResponse = response.generate(true, 'wrong password login failed', 400, null);
                    reject(apiResponse);
                }
            })
        })
    }//end of validating password

    // generate token if user is valid
    let generateToken = (userDetails) => {
        //generating token on validation
        return new Promise((resolve, reject) => {
            tokenLib.generateToken(userDetails, (error, tokenDetails) => {
                if (error) {
                    logger.error(error,'signin : generateToken',10)
                    apiResponse = response.generate(true, 'failed to generate token', 500, null);
                    reject(apiResponse);
                }
                else {
                    tokenDetails.userDetails = userDetails;
                    resolve(tokenDetails);
                }
            })
        })
    }//end of generating token

    // saving generated token for future authorization
    let saveToken = (tokenDetails) => {

        return new Promise((resolve, reject) => {
            authModel.findOne({ 'userId': tokenDetails.userDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    logger.error(err.message, 'userController:saveToken', 10);
                    apiResponse = response.generate(true, err.message, 500, null);
                    reject(apiResponse);
                }
                else if (checkLib.isEmpty(retrievedTokenDetails)) {
                    //save new auth
                    let newauthModel = new authModel(
                        {
                            userId: tokenDetails.userDetails.userId,
                            authToken: tokenDetails.token,
                            tokenSecret: tokenDetails.tokenSecret,
                            tokenGenerationTime: Date.now()
                        }
                    );

                    newauthModel.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error('error while saving new auth model', 'userController:savetoken', 10);
                            apiResponse = response.generate(true, err.message, 500, null);
                            reject(apiResponse)
                        }
                        else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }

                            resolve(responseBody)
                        }
                    })
                }
                else {
                    //already present,so,update it
                    retrievedTokenDetails.authToken = tokenDetails.token;
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
                    retrievedTokenDetails.tokenGenerationTime = Date.now();

                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error('error while updating token', 'userController:savetoken', 10);
                            apiResponse = response.generate(true, 'error while updating auth token', 500, null);
                            reject(apiResponse)
                        }
                        else {
                            //console.log('new token details after log in'+newTokenDetails.authToken)
                            let response = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(response)
                        }
                    })
                }
            })
        });//end of promise for saving token
    }//end of savetoken function

    validateInputs(req,res)
        .then(findUser)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            apiResponse = response.generate(false, 'login successfull', 200, resolve);
            res.status(200);
            res.send(apiResponse);
        })
        .catch((error) => {
            res.status(error.status);
            res.send(error);
        })
}

// signout user
let signOut = (req, res) => {
    authModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            logger.error(err.message, 'user Controller: logout', 10)
            apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (checkLib.isEmpty(result)) {
            apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })

} // end of the logout function.

module.exports=
{
    signUp,
    signIn,
    signOut
}