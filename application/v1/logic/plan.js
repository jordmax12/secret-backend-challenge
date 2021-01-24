const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const PlanItem = require('./plan-item');
const {getNextRunner} = require('../model/plan');

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

    async _runnerFiller(planItem, currentIndex) {
        const totalRunners = this._plan.plan.filter((_pi) => _pi.size === '2.5x7');
        const findRunnerIndex = totalRunners.findIndex((r) => r.id === planItem.id);
        const findFirstOrderDate = totalRunners.sort((a, b) => {
            return moment(a.order_date) - moment(b.order_date);
        });
        const _getNextRunner = await getNextRunner(
            findFirstOrderDate[0].order_date,
            totalRunners.length + (findRunnerIndex - 1 > -1 ? findRunnerIndex - 1 : 0) - 1
        );

        if (_getNextRunner.length > 0) {
            const {id, size, order_date, sku, rush} = _getNextRunner[0];
            return {
                id,
                position: currentIndex,
                order_date: moment(order_date).toISOString(),
                sku,
                rush,
                size,
            };
        }

        return null;
    }

    _updateRunnerPosition(index, newPosition) {
        this._plan.plan[index].position = newPosition;
    }

    _findNextRunnerInPlan(id) {
        const {plan} = this._plan;
        const findRunners = plan.filter((_pi) => _pi.size === '2.5x7');
        const findCurrentRunnerIndex = findRunners.findIndex((_pi) => _pi.id === id);
        if (findCurrentRunnerIndex > -1) {
            const findNextRunner = findRunners[findCurrentRunnerIndex + 1];
            return findNextRunner;
        }
        return null;
    }

    _findNextChangedRunner(id) {
        const {plan} = this._plan;
        const findRunners = plan.filter((_pi) => _pi.size === '2.5x7');
        let findCurrentRunnerIndex = plan.findIndex((_pi) => _pi.id === id);
        let nextRunner = null;
        if (findCurrentRunnerIndex > -1) {
            /* eslint-disable-next-line no-constant-condition */
            while (true) {
                if (findCurrentRunnerIndex > findRunners.length - 1) break;
                const findNextRunner = findRunners[findCurrentRunnerIndex];
                if (findNextRunner.hasChanged) {
                    nextRunner = findNextRunner;
                    break;
                }

                findCurrentRunnerIndex++;
            }
        }
        return nextRunner;
    }

    async _findIfNeedsRunner(planItem, position) {
        if (planItem.size === '2.5x7') {
            const findNextRunner = this._findNextRunnerInPlan(planItem.id);
            if (findNextRunner) {
                const runnerIndex = this._plan.plan.filter((x) => x).findIndex((x) => x.id === findNextRunner.id);
                if (runnerIndex) {
                    this._plan.plan[runnerIndex].hasChanged = true;
                    this._plan.plan[runnerIndex].newPosition = position;
                }
            } else {
                const getRunnerFromDB = await this._runnerFiller(planItem, position);
                return getRunnerFromDB;
            }
        }
        return null;
    }

    async hydratePositions() {
        const {plan} = this._plan;
        const _plan = plan;
        const runnerFillers = [];
        const reassignedRunners = [];
        for (const [index, planItem] of _plan.entries()) {
            const hasItemBeenReassigned = this._plan.plan[index].hasChanged;

            if (hasItemBeenReassigned) {
                const cachedItem = this._plan.plan[index];
                reassignedRunners.push({
                    id: cachedItem.id,
                    index,
                    new: this._plan.plan[index].newPosition,
                });
            } else {
                const position = index + 1;
                this._plan.plan[index].position = position;
                const foundRunnerInDB = await this._findIfNeedsRunner(planItem, position);
                if (foundRunnerInDB) {
                    runnerFillers.push({
                        id: this._plan.plan[index].id,
                        index,
                        data: foundRunnerInDB,
                    });
                }
            }
        }
        const changesInPosition = {
            currentIndex: 0,
            changes: 0,
        };

        for (const reassignedRunner of reassignedRunners) {
            this._updateRunnerPosition(reassignedRunner.index, reassignedRunner.new);
            const findNextRunner = this._findNextChangedRunner(reassignedRunner.id);
            const findNextRunnerIndex = findNextRunner
                ? this._plan.plan.findIndex((x) => x.id === findNextRunner.id)
                : this._plan.plan.length;

            for (let i = reassignedRunner.index; i < findNextRunnerIndex; i++) {
                const newPosition = this._plan.plan[i].position - changesInPosition.changes;
                this._updateRunnerPosition(i, newPosition);
                if (this._plan.plan[i].hasChanged) {
                    changesInPosition.currentIndex = i;
                    changesInPosition.changes += 1;
                }
            }
        }

        for (const [index, filler] of runnerFillers.entries()) {
            const {position} = this._plan.plan[filler.index];
            runnerFillers[index].data.position = position;
        }

        this.overwritePlan([...this._plan.plan, ...runnerFillers.map((r) => r.data)]);
    }

    export() {
        const _planObj = this._plan;
        const exportPlan = {..._planObj, plan: []};

        _planObj.plan = _planObj.plan.sort((a, b) => {
            if (a.position === b.position) {
                return moment(a.order_date) - moment(b.order_date);
            }
            return a.position > b.position ? 1 : -1;
        });

        _planObj.plan.forEach((_planItem) => {
            const newPlanItem = new PlanItem(_planItem);
            exportPlan.plan.push(newPlanItem.export());
        });

        return exportPlan;
    }
}

module.exports = Plan;
