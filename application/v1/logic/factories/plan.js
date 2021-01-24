const { getMostRecentOrdersByRollLength } = require('../../model/plan');

exports.getPlan = async (rollLength, rush = false) => {
    const planItems = getMostRecentOrdersByRollLength(rollLength, rush);
    return planItems;
}