let logger = require('../lib/loggerLib');
let responseLib = require('../lib/responseLib');
let productModel = require('../model/products');
let checkLib = require('../lib/checkLib')

let response;

let postNewProduct = (req,res)=>
{
    // validate inputs
    let validateInputs = ()=>
    {
        return new Promise((resolve,reject)=>
        {
            if(req.body.Id && req.body.Name && req.body.Image && req.body.Price)
            {
                resolve(req)
            }
            else
            {
                logger.error('one or more parameter is missing','postNewProduct:validateInputs',10);
                response = responseLib.generate(true,'one or more parameter is missing',400,null);
                reject(response);
            }
        })
    } //end of validate inputs

    // check if id is present or not
    let checkId = ()=>
    {
        return new Promise((resolve,reject)=>
        {
            productModel.findOne({'Id':req.body.Id},(err,result)=>
            {
                if(err)
                {
                    logger.error(err.message,'postNewProduct:checkId',10);
                    response = responseLib.generate(true,err.message,500,null);
                    reject(response)
                }
                else if(!checkLib.isEmpty(result))
                {
                    logger.error('product with id already present','postNewProduct:checkId',10);
                    response = responseLib.generate(true,'product with id already present',400,null);
                    reject(response)
                }
                else{
                    resolve(req);
                }
            })
        })
    }

    // if no product with given id is present than create new product
    let newProduct = ()=>
    {
        return new Promise((resolve,reject)=>
        {
            let newProduct = new productModel(
                {
                    Id:req.body.Id,
                    Name:req.body.Name,
                    Image:req.body.Image,
                    Price:req.body.Price,
                    PublishedOn:Date.now()
                }
            )

            newProduct.save((err,result)=>
            {
                if(err)
                {
                    logger.error('error while saving new product','postNewProduct:newProduct',10);
                    response = responseLib.generate(true,
                        'error while creating new product',500,null);
                        reject(response);
                }
                else
                {
                    logger.info('new product created','postNewProduct:newProduct',5);
                    response = responseLib.generate(false,'new product created',200,result);
                    resolve(response);
                }
            })
        })
    }
    // end of creating new product promise

    validateInputs(req,res)
    .then(checkId)
    .then(newProduct)
    .then((resolve)=>
    {
        res.send(resolve)
    })
    .catch((err)=>
    {
        res.send(err)
    })
}

// getting all products
let getAllProducts = (req,res)=>
{
    productModel.find((err,result)=>
    {
        if(err)
        {
            logger.error('error while finding all products','getAllProducts',10);
            response = responseLib.generate(true,'error while finding all products',500,null);
            res.send(response)
        }
        else
        {
            logger.info('all products found','getAllProducts',5);
            response = responseLib.generate(false,'all products details found',200,result);
            res.send(response)
        }
    })
}

module.exports=
{
    postNewProduct,
    getAllProducts
}