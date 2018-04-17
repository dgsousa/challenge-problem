const fs = require("fs");
//Create Logger and its callback
const logger = fs.createWriteStream("deduplicator.log");

//Logger callback gets called when a de-deduplication occurs
const update = (field, oldRecord, newRecord) => {
    const updateString = `Update: Duplicate ${field}
        Removed: ${JSON.stringify(oldRecord)}
        Added: ${JSON.stringify(newRecord)}\n\n`;
    console.log(updateString);
    return updateString;
}

const logRecords = (type, records) => {
    const formattedRecords = records.map((record) => {
        return JSON.stringify(record) + "\n\t";
    })
    const recordString = `${type}:
        ${formattedRecords}\n`;
    console.log(recordString);
    return recordString;
};

module.exports = {
    logger,
    update,
    logRecords
}