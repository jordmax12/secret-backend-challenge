module.exports = app => {
    app.get('/v1/plans/', async (request, response) => {
        response.status(200).send({
            hello: 'world'
        })
    })
}

