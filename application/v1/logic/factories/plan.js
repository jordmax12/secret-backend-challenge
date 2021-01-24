const {getMostRecentOrdersByRollLength} = require('../../model/plan');
const PlanLogic = require('../plan');
const moment = require('moment');

exports.getPlan = async (rollLength, rush = false) => {
    let planItems = await getMostRecentOrdersByRollLength(rollLength, rush);
    // need to take in account total length
    const plan = new PlanLogic({ length: planItems[planItems.length - 1].total_roll_length });
    for(const planItem of planItems) {
        const { id, order_date, rush, size, sku  } = planItem;
        plan.addToPlan({
            id,
            position: 0,
            order_date: moment(order_date).toISOString(),
            sku,
            rush,
            size
        });
    }
    await plan.hydratePositions();
    return plan.export(rush);
};
