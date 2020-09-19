let transactionModel = require('../model/transaction');
let logger = require('../lib/loggerLib');
let checkLib = require('../lib/checkLib');
let responseLib = require('../lib/responseLib');
let shortid = require('shortid')

let apiresponse;

let getAllTransactions = (req, res) => {

    if (req.user.userId) {
        transactionModel.find({ userId: req.user.userId }, (err, result) => {
            if (err) {
                logger.error('error while finding all transactions', 'getAllTransactions', 10);
                apiresponse = responseLib.generate(true, 'error while finding all transactions', 500, null);
                res.send(apiresponse)

            }
            else if (checkLib.isEmpty(result)) {
                logger.info('no transactions done yet', 'getAllTransactions', 5);
                apiresponse = responseLib.generate(false, 'no transaction yet', 404, null);
                res.send(apiresponse)
            }
            else {
                logger.info('all transactions found', 'getAllTransactions', 5);
                apiresponse = responseLib.generate(false, 'all transactions found', 200, result);
                res.send(apiresponse)
            }
        })
    }
}

let addNewTransaction = (req, res) => {
    // console.log(JSON.parse(req.body.data));
    let data = JSON.parse(req.body.data);

    let validateInputs = () => {
        return new Promise((resolve, reject) => {
            if (req.user.userId && req.body.data && req.body.totalPrice) {
                resolve(req);
            }
            else {
                apiresponse = responseLib.generate(true, 'no sufficient data', 500, null);
                reject(apiresponse)
            }
        })
    }
    // end of validate inputs

    // make new transaction if valid
    let makeTransaction = () => {
        return new Promise((resolve, reject) => {

            let current =
            {
                userId: req.user.userId,
                transactionId: shortid.generate(),
                totalPrice: req.body.totalPrice,
                products: [],
                orderedOn:Date.now()
            }

            // loop through req data to add product details
            data.forEach((file) => {
                let product =
                {
                    productId: file.productId,
                    productName: file.productName,
                    productPrice: file.productPrice
                };

                current.products.push(product)
            })

            let newTransaction = new transactionModel(current);

            newTransaction.save((err,result)=>
            {
                if(err)
                {
                    logger.error('error while saving new transaction','maketransaction',10);
                    apiresponse=responseLib.generate(true,'error while making transaction',500,null);
                    reject(apiresponse)
                }
                else
                {
                    logger.info('new transaction saved','maketransaction',5);
                    apiresponse=responseLib.generate(false,'new order made',200,result);
                    resolve(apiresponse)
                }
            })
        })
    }
    // end of make transaction

    validateInputs(req,res)
    .then(makeTransaction)
    .then((resolve)=>
    {
        res.send(resolve)
    })
    .catch((err)=>
    {
        res.send(err)
    })
}

module.exports =
{
    getAllTransactions,
    addNewTransaction
}