const {v4: uuidv4} = require('uuid');
const PlanItem = require('./plan-item');

class Plan {
    constructor(planObj) {
        this._plan = {
            roll_id: planObj.roll_id || uuidv4(),
            length: planObj.length || null,
            plan: planObj.plan || []
        };
    }

    get roll_id() {
        return this._plan.roll_id;
    }

    get length() {
        return this._plan.length;
    }

    set length(length) {
        this._plan.length = length;
    }

    get plan() {
        return this._plan.plan;
    }

    set plan(plan) {
        this._plan.plan = plan;
    }

    addToPlan(planItem) {
        const newPlanItem = new PlanItem(planItem);
        this._plan.plan.push(newPlanItem.export())
    }

    overwritePlan(planItems) {
        this._plan.plan = planItems.map(planItem => new PlanItem(planItem));
    }

    _sortPlanRush() {

    }

    _sortPlan() {

    }

    sortPlan() {
        
    }

    export() {
        const { plan } = this._plan;
        const exportPlan = { ...this._plan, plan: [] };
        // Not necessarily needed, but just to be sure we
        // funnel all planItems through the PlanItem class
        // before exporting is a good idea.
        plan.forEach(_planItem => {
            const newPlanItem = new PlanItem(planItem);
            exportPlan['plan'].push(newPlanItem.export())
        })

        return exportPlan;
    }
}

module.exports = Plan;
