exports.validGetPlanRequest = (req) => {
    const { roll_length, include_rush } = req.query;
    if(!roll_length) return false;
    else {
        const rollLengthMod = roll_length % 1;
        if(Number.isNaN(rollLengthMod)) {
            return false;
        }
    }

    if(include_rush && typeof include_rush !== "boolean") {
        return false;
    }

    return true;
}