class PlanItem {
    constructor(planItemObj) {
        this._planItem = {
            id: planItemObj.id || null,
            position: planItemObj.position || 0,
            size: planItemObj.size || [],
            order_date: planItemObj.order_date || null,
            sku: planItemObj.sku || null,
            rush: planItemObj.rush || false,
        };
    }

    get id() {
        return this._planItem.id;
    }

    set id(id) {
        this._planItem.id = id;
    }

    get position() {
        return this._planItem.position;
    }

    set position(position) {
        this._planItem.position = position;
    }

    get size() {
        return this._planItem.size;
    }

    set size(size) {
        this._planItem.size = size;
    }

    get order_date() {
        return this._planItem.order_date;
    }

    set order_date(order_date) {
        this._planItem.order_date = order_date;
    }

    get sku() {
        return this._planItem.sku;
    }

    set sku(sku) {
        this._planItem.sku = sku;
    }

    get rush() {
        return this._planItem.rush;
    }

    set rush(rush) {
        this._planItem.rush = rush;
    }

    export() {
        return this._planItem;
    }
}

module.exports = PlanItem;
