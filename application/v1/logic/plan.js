const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const PlanItem = require('./plan-item');
const { getNextRunner } = require('../model/plan');

class Plan {
    constructor(planObj) {
        this._plan = {
            roll_id: planObj.roll_id || uuidv4(),
            length: planObj.length || null,
            plan: planObj.plan || [],
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
        this._plan.plan.push(newPlanItem.export());
    }

    overwritePlan(planItems) {
        this._plan.plan = planItems.map((planItem) => new PlanItem(planItem));
    }
    
    async _runnerFiller(planItem, currentIndex, totalRunners) {
        const findRunnerIndex = totalRunners.findIndex(r => r.id === planItem.id);
        const _getNextRunner = await getNextRunner(totalRunners[0].order_date, (totalRunners.length + findRunnerIndex) - 1);

        if(_getNextRunner.length > 0) {
            const { id, size, order_date, sku, rush } = _getNextRunner[0];
            return {
                id,
                position: currentIndex + 1,
                order_date: moment(order_date).toISOString(),
                sku,
                rush,
                size
            }
        }

        return null;
    }

    async _findRunner(planItem, currentIndex, totalRunners) {
        if(planItem.size === '2.5x7') {
            const generateRunner = await this._runnerFiller(planItem, currentIndex, totalRunners);
            return generateRunner;
        } 
        return null
    }

    async hydratePositions() {
        const { plan } = this._plan;
        const _plan = plan;
        const totalRunners = _plan.filter(_pi => _pi.size === "2.5x7");
        const runnerFillers = [];
        for(const [index, planItem] of _plan.entries()) {
            this._plan.plan[index].position = index + 1;
            const needsRunner = await this._findRunner(planItem, index, totalRunners);
            if(needsRunner) {
                runnerFillers.push(needsRunner);
            }
        }

        this.overwritePlan([...this._plan.plan, ...runnerFillers])
    }

    export() {
        const _planObj = this._plan;
        const exportPlan = {..._planObj, plan: []};

        _planObj.plan = _planObj.plan.sort((a, b) => {
            if (a.position === b.position) {
                // Price is only important when cities are the same
                return moment(a.order_date) - moment(b.order_date);
             }
             return a.position > b.position ? 1 : -1;
        })

        _planObj.plan.forEach((_planItem) => {
            const newPlanItem = new PlanItem(_planItem);
            exportPlan.plan.push(newPlanItem.export());
        });

        return exportPlan;
    }
}

module.exports = Plan;
