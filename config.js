let config =
{
    allowedCorsOrigin:'*',
    apiVersion:'/api/v1',
    port:3000 || process.env.PORT,
    db:
    {
        uri:'mongodb+srv://phursang:phursang@123@oms.x9obw.mongodb.net/<dbname>?retryWrites=true&w=majority'
    }
}

module.exports = config;