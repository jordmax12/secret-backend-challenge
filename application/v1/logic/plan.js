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

    // grab a runner from the database.
    // we want to grab the next runner, based on the current planItem.
    // this involves some logic to determine how much to offset in our query, so we
    // can get the NEXT runner in relation to the current planItem.
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

    // helper function to update a position of a runner.
    _updateRunnerPosition(index, newPosition) {
        this._plan.plan[index].position = newPosition;
    }

    // This will find the next runner in plan, if exists.
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

    // This function will grab the next runner in the plan that was changed.
    // this is useful because we need to know which planItems to increment the position.
    // but we dont want to mess with a position thats been changed already.
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

    // determines if a planItem needs a runner and if so, will go and find one.
    async _findIfNeedsRunner(planItem, position) {
        if (planItem.size === '2.5x7') {
            const findNextRunner = this._findNextRunnerInPlan(planItem.id);
            // try to find the runner in our current plan
            if (findNextRunner) {
                const runnerIndex = this._plan.plan.filter((x) => x).findIndex((x) => x.id === findNextRunner.id);
                if (runnerIndex) {
                    this._plan.plan[runnerIndex].hasChanged = true;
                    this._plan.plan[runnerIndex].newPosition = position;
                }
                // if none exists, try to grab one from database
            } else {
                const getRunnerFromDB = await this._runnerFiller(planItem, position);
                return getRunnerFromDB;
            }
        }
        return null;
    }

    // NOTE: this function got a little long, if i had more time i would try to split it up, or change my logic altogether.
    // I think it was a little ambitious trying to do it this way, with the time allocated.
    // if I could do over, I think I would grab x amount of items from the DB, and if those
    // didnt fill the roll_length, then keep asking for more until it does.
    // that way we can keep a lot of this logic in code thats being done in SQL (roll_length calculation mostly)
    async hydratePositions() {
        const {plan} = this._plan;
        const _plan = plan;
        const runnerFillers = [];
        const reassignedRunners = [];
        for (const [index, planItem] of _plan.entries()) {
            // determine if this item has been changed (meaning, is this item a runner which has been re-assigned?)
            const hasItemBeenReassigned = this._plan.plan[index].hasChanged;

            if (hasItemBeenReassigned) {
                const cachedItem = this._plan.plan[index];
                // add to queue, to process later (dont want to mess with the current iterable)
                reassignedRunners.push({
                    id: cachedItem.id,
                    index,
                    new: this._plan.plan[index].newPosition,
                });
            } else {
                // this is not an item that was re-assigned, let's do the groundwork to set it up.
                const position = index + 1;
                this._plan.plan[index].position = position;
                // if anything is returned from this method, we know its a runner who tried to grab a
                // runner from our current plan, but couldn't. and went to the DB to find one.
                // meaning, this runner wont be in our plan, and we will need to add later.
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
        // lets keep track of how many changes we make
        // this will help us calculate the newPosition
        // of items that need to be adjusted.

        const changesInPosition = {
            currentIndex: 0,
            changes: 0,
        };
        // they need to be adjusted if we pulled a runner from our
        // current plan, meaning, the position we found prior,
        // wont be accurate anymore, so we need to adjust.
        for (const reassignedRunner of reassignedRunners) {
            this._updateRunnerPosition(reassignedRunner.index, reassignedRunner.new);
            const findNextRunner = this._findNextChangedRunner(reassignedRunner.id);
            const findNextRunnerIndex = findNextRunner
                ? this._plan.plan.findIndex((x) => x.id === findNextRunner.id)
                : this._plan.plan.length;

            // this for loop will go through all the items from our current position, TO the next runner that has been
            // changed. This is because we have adjusted a runners position, therefore need to now adjust all the
            // subsequent items position to reflect this change.
            // otherwise their position will be +1, or +x more than the actual position
            for (let i = reassignedRunner.index; i < findNextRunnerIndex; i++) {
                const newPosition = this._plan.plan[i].position - changesInPosition.changes;
                this._updateRunnerPosition(i, newPosition);
                if (this._plan.plan[i].hasChanged) {
                    changesInPosition.currentIndex = i;
                    changesInPosition.changes += 1;
                }
            }
        }
        // simple run through of the fillers we had, and just setting its correct
        // position by finding the position of the item at the index we stored earlier.
        for (const [index, filler] of runnerFillers.entries()) {
            const {position} = this._plan.plan[filler.index];
            runnerFillers[index].data.position = position;
        }
        // just overwrite the current plan to be a concatenation of the two arrays (it will be sorted later)
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
