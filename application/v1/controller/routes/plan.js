const { getPlan } = require('../../logic/factories/plan');

module.exports = (app) => {
    app.get('/v1/plan/', async (request, response) => {
        // TODO: need to add validator to make sure we have rollLength + rollLength is an float
        const results = await getPlan(request.query.rollLength);
        response.status(200).send({
            data: results
        })
    });
};
