const {getPlan} = require('../../logic/factories/plan');
const validator = require('../../logic/validator');

module.exports = (app) => {
    app.get('/v1/plan/', async (request, response) => {
        if(validator.validGetPlanRequest(request)) {
            const results = await getPlan(request.query.roll_length, request.query.include_rush);
            response.status(200).send({
                data: results,
            });
            return;
        }

        response.status(500).send({
            error: 'Seemingly invalid request, make sure to supply roll_length as a numeric value.',
        });
    });
};
