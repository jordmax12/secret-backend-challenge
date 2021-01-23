const _swap = (arr, i, j) => {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
};

exports.sortFiles = (arr, ext) => {
    for (let i = 0; i < arr.length; i += 1) {
        for (let j = 1; j < arr.length; j += 1) {
            const prev = arr[j - 1].split(ext)[0];
            const next = arr[j].split(ext)[0];
            if (parseInt(prev, 10) > parseInt(next, 10)) {
                _swap(arr, j - 1, j);
            }
        }
    }
    return arr;
};