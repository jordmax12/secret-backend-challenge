const { getPlan } = require('../../logic/factories/plan');

module.exports = (app) => {
    app.get('/v1/plan/', async (request, response) => {
        console.log('logging params', request.query)
        const results = await getPlan(request.query.rollLength);
        response.status(200).send({
            data: results
        })
    });
};
