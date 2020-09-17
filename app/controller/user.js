let response = require('../lib/responseLib');
let validateInput = require('../lib/paramsValidationLib');
let logger = require('../lib/loggerLib');
let checkLib = require('../lib/checkLib');
let shortid = require('shortid');
let passwordLib = require('../lib/generatePasswordLib')

let UserModel = require('../model/user')

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
            res.send(apiResponse)
        })
}

let signIn = (req,res)=>
{
    // 
}

module.exports=
{
    signUp,
    signIn
}