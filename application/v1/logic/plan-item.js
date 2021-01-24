// "plan":[
//     {
//         "id": 5683,
//         "position": 1,
//         "size": "2.5x7",
//         "order_date": "2020-10-13 04:27:30-07:00",
//         "sku": "RS-1234-27",
//         "rush": true
//     },

class PlanItem {
    constructor(planItemObj) {
        this._plan = {
            id: planItemObj.id || null,
            position: planItemObj.position || 0,
            size: planItemObj.size || [],
            order_date: planItemObj.order_date || null,
            sku: planItemObj.sku || null,
            rush: planItemObj.rush || false,
        };
    }

    get id() {
        return this._plan.id;
    }

    set id(id) {
        this._plan.id = id;
    }

    get position() {
        return this._plan.position;
    }

    set position(position) {
        this._plan.position = position;
    }

    get size() {
        return this._plan.size;
    }

    set size(size) {
        this._plan.size = size;
    }

    get order_date() {
        return this._plan.order_date;
    }

    set order_date(order_date) {
        this._plan.order_date = order_date;
    }

    get sku() {
        return this._plan.sku;
    }

    set sku(sku) {
        this._plan.sku = sku;
    }

    get rush() {
        return this._plan.rush;
    }

    set rush(rush) {
        this._plan.rush = rush;
    }

    export() {
        return this._plan;
    }
}

module.exports = PlanItem;