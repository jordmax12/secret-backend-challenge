const { getMostRecentOrdersByRollLength } = require('../../model/plan');

exports.getPlan = async (roll_length, rush = false) => {
    return getMostRecentOrdersByRollLength(roll_length, rush);
}