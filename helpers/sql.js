const { BadRequestError } = require("../expressError");

// Helper Function: to build SET clause of SQL (partial) UPDATE statement.
/// The function recieves two parameters:
/// param 1: dataToUpdate is an {object} {field1: newVal, field2: newVal }
/// param 2: jsToSql is an {object}, this object is used to map javascript data
/// to sql column names, {firstName: "first_name", age: "age"}
// The Function returns an {object} containing 2 properties {sqlSetCols, dataToUpdate}
// Ex:  { setCols: ' "first_name"=$1, "age"=$2', values: ['Alicia', 32] }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}

module.exports = { sqlForPartialUpdate };
