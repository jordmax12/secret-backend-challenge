exports.validGetPlanRequest = (req) => {
    const {roll_length, include_rush} = req.query;
    if (!roll_length) return false;
    // determine if supplied roll_length is either an integer or float.
    // not sure if this is the BEST way for that, but one I found and easily readable.
    const rollLengthMod = roll_length % 1;
    if (Number.isNaN(rollLengthMod)) {
        return false;
    }

    if (include_rush && typeof include_rush !== 'boolean') {
        return false;
    }

    return true;
};
