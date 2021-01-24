const { getMostRecentOrdersByRollLength } = require('../../model/plan');

exports.getPlan = async (roll_length) => {
    return getMostRecentOrdersByRollLength(roll_length);
}