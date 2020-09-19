let authMiddleware = require('../middleware/authMiddleware');
let controller = require('../controller/transaction')

let setRoutes = (app)=>
{
    // get all transactions
    app.get(`/api/v1/transaction/all`,authMiddleware.isAuthorized,controller.getAllTransactions);

    // new transaction
    app.post(`/api/v1/transaction/new`,authMiddleware.isAuthorized,controller.addNewTransaction);
}

module.exports=
{
    setRoutes
}