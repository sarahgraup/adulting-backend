const { BadRequestError } = require("../expressError");

/**
 * Reformats javascript values to be updated for SQL SET 
 * @param {Object} dataToUpdate data:{name, description, numEmployees, logoUrl}
 * @param {Object} jsToSql altering javascript object into sql variables
 *  example: {firstName: "first_name",lastName: "last_name"}
 * 
 * @returns {Object} {sqlsetCols, sqlvalues}
 * example: {setCols:'"first_name"=$1, values: ['Aliya'] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };