let logger = require('../lib/loggerLib');
let responseLib = require('../lib/responseLib');
let checkLib = require('../lib/checkLib')

let response;

let cartModel = require('../model/cart')

let addProductToCart = (req, res) => {
    //check if all the inputs are provided or not
    let checkInputs = () => {
        return new Promise((resolve, reject) => {
            if (req.body.Id && req.body.userId && req.body.Name && req.body.Image && req.body.Price) {
                resolve(req)
            }
            else {
                logger.error('no sufficient data provided', 'addProductToCart:checkInputs', 10);
                response = responseLib.generate(true, 'no sufficient data provided', 400, null)
                reject(response)
            }
        })
    }
    // end of checking inputs

    // adding to cart
    let addToCart = () => {
        return new Promise((resolve, reject) => {
            // check if cart already exist for user or not
            cartModel.findOne({ userId: req.body.userId }, (err, result) => {
                if (err) {
                    logger.error('error on database', 'addProductToCart:addToCart', 10);
                    response = responseLib.generate(true, 'error on database', 500, null);
                    reject(response)
                }
                else if (checkLib.isEmpty(result)) {
                    // result is empty,it means user has no products in cart as of now,so create new
                    let newCart = new cartModel(
                        {
                            userId: req.body.userId,
                            cartProducts: [{
                                productId: req.body.Id,
                                productName: req.body.Name,
                                productImage: req.body.Image,
                                productPrice: req.body.Price
                            }]
                        }
                    );

                    // save in database
                    newCart.save((err, newCartDetail) => {
                        if (err) {
                            logger.error('error while saving new cart', 'addProductToCart:addToCart', 10);
                            response = responseLib.generate(true, 'error while saving new cart', 500, null);
                            reject(response)
                        }
                        else {
                            logger.info('new cart created', 'addProductToCart', 5);
                            response = responseLib.generate(false, 'added to cart', 200, newCartDetail);
                            resolve(response)
                        }
                    })
                }
                else {
                    // if cart is not empty,than update by pushing new product into existing cart of user

                    let itemToPush =
                    {
                        productId: req.body.Id,
                        productName: req.body.Name,
                        productImage: req.body.Image,
                        productPrice: req.body.Price
                    }

                    //using push method for inserting onto array

                    let options = {
                        $push: {
                            cartProducts: {
                                $each: [itemToPush]
                            }
                        }
                    }

                    //now add item to list
                    cartModel.updateOne({ userId: req.body.userId }, options)
                        .exec((err, result) => {
                            if (err) {
                                logger.error('Error while adding product to cart', 'addProductToCart', 10);
                                response = responseLib.generate(true, 'Error while adding product to cart', 500, null);
                                reject(response)
                            }
                            else {
                                logger.info('product added to cart', 'addProductToCart', 5);
                                response = responseLib.generate(false, 'product added to cart', 200, result);
                                resolve(response)
                            }
                        })
                }
            })

        })
    }

    checkInputs(req,res)
    .then(addToCart)
    .then((resolve)=>
    {
        res.send(resolve)
    })
    .catch((err)=>
    {
        res.send(err)
    })
}
// end of adding product to cart

// getting user cart details

let getUserCartDetails = (req,res)=>
{
    // check for userId
    if(req.user.userId)
    {
        cartModel.findOne({userId:req.user.userId},(err,result)=>
        {
            if(err)
            {
                logger.error(err.message,'getUserCartDetails',10);
                response = responseLib.generate(true,'error while finding cart details',500,null);
                res.send(response)
            }
            else if(checkLib.isEmpty(result))
            {
                logger.info('no cart has been created by user till now','getUserCartDetails',5);
                response=responseLib.generate(false,'no cart created',404,result);
                res.send(response)
            }
            else
            {
                logger.info('cart details found','getUserCartDetails',5);
                response = responseLib.generate(false,'cart details found',200,result);
                res.send(response)
            }
        })
    }
}
// end of getting cart details of user

// clearing carts
let clearAllCarts = (req,res)=>
{
    if(req.user.userId)
    {
        cartModel.findOneAndDelete({userId:req.user.userId},(err,result)=>
        {
            if(err)
            {
                logger.error(err.message,'clearAllCarts',10);
                response = responseLib.generate(true,'error while clearing carts',500,null);
                res.send(response)
            }
            else
            {
                logger.info('cart cleared','clearAllCarts',5);
                response=responseLib.generate(false,'cart cleared',200,result);
                res.send(response)
            }
        })
    }
}

module.exports =
{
    addProductToCart,
    getUserCartDetails,
    clearAllCarts
}