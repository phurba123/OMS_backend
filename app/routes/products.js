let config = require('../../config');
let controller = require('../controller/products');
let authMiddleware = require('../middleware/authMiddleware')

let setRoutes = (app)=>
{
    let adminBaseUri = config.apiVersion+'/admin/product';
    let baseUri = config.apiVersion+'/product'

    //post new product
    app.post(`${adminBaseUri}/post`,controller.postNewProduct);

    // get all products
    app.get(`${baseUri}/view/all`,authMiddleware.isAuthorized, controller.getAllProducts);
    
}

module.exports=
{
    setRoutes
}