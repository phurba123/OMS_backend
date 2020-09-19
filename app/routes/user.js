const config = require('../../config');
const controller = require('../controller/user');
const authMiddleware = require('../middleware/authMiddleware')

let setRoutes = (app)=>
{
    let baseUri = `${config.apiVersion}/user`;

    //signup route
    app.post(`${baseUri}/signup`,controller.signUp);

    // signin route
    app.post(`${baseUri}/signin`,controller.signIn);

    // signout route
    app.post(`${baseUri}/signout`,authMiddleware.isAuthorized, controller.signOut);

    // reset password
    app.post(`${baseUri}/reset/password`,controller.resetPassword)
}

module.exports=
{
    setRoutes:setRoutes
}