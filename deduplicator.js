const fs = require("fs");

const { logger, update, logRecords } = require("./logger");

const convertToUnix = date => {
    return (new Date(date)).getTime();
}

//Go through a list of records and remove records duplicated by the given field
const deduplicator = (records, field) => {
    const nonDuplicates = {};
    records.forEach((record) => {
        //If the record already exists compare its timestamp with the current record
        if(nonDuplicates[record[field]] && convertToUnix(nonDuplicates[record[field]].entryDate) <= convertToUnix(record.entryDate)) {
            logger.write(update(field, nonDuplicates[record[field]], record));
            nonDuplicates[record[field]] = record;
        //If the record doesn't already exist add it
        } else if(!nonDuplicates[record[field]]) {
            nonDuplicates[record[field]] = record;
        }
    })
    //map through the unique records object and return the records
    return Object.keys(nonDuplicates).map(key => nonDuplicates[key]);
}

//Takes an array of fields to deduplicate by
const multiDeduplicator = (records, fields) => {
    return fields.reduce((acc, curr) => {
        //Checks to make sure the field is valid, skips over it if not valid
        if(!records[0][curr]) return acc;
        return deduplicator(acc, curr);
    }, records);
}


const deduplicateRecords = (file = "leads.json", ...args) => {
    const fields = args[0] ? args : ["_id", "email"];
    return fs.readFile(file, "utf-8", (err, data) => {
        if(err) console.log(err);
        const records = JSON.parse(data).leads;
        logger.write(logRecords("Initial Records", records));
        const deduplicatedRecords = multiDeduplicator(records, fields);
        logger.write(logRecords("Deduplicated Records", deduplicatedRecords));
    })
}


deduplicateRecords(process.argv[2], ...process.argv.slice(3));