const config = require('../../config');
const controller = require('../controller/user')

let setRoutes = (app)=>
{
    let baseUri = `${config.apiVersion}/user`;

    //signup route
    app.post(`${baseUri}/signup`,controller.signUp);

    // login route
    app.post(`${baseUri}/signin`,controller.signIn);
}

module.exports=
{
    setRoutes:setRoutes
}