let authMiddleware = require('../middleware/authMiddleware');
let controller = require('../controller/cart');
let config = require('../../config')

let setRoutes = (app)=>
{
    let baseUri = `${config.apiVersion}/cart`

    //adding product to cart
    app.post(`${baseUri}/add`,authMiddleware.isAuthorized, controller.addProductToCart);

    // getting user cart details
    app.get(`${baseUri}/view` , authMiddleware.isAuthorized ,controller.getUserCartDetails)

    // clearing cart
    app.post(`${baseUri}/clear`,authMiddleware.isAuthorized, controller.clearAllCarts)
}

module.exports= 
{
    setRoutes
}