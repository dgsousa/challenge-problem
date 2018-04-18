const { logger, update, logRecords } = require("./logger");
const readFileAsync = require("./utility");

const convertToUnix = date => {
    const dateObj = new Date(date);
    return dateObj.getTime();
}

//Go through a list of records and remove records duplicated by the given field
const deduplicator = (records, field) => {
    const nonDuplicates = {};
    records.forEach((record) => {
        const valueToDedup = record[field];
        //If the record already exists compare its timestamp with the current record
        if(nonDuplicates[valueToDedup] && convertToUnix(nonDuplicates[valueToDedup].entryDate) <= convertToUnix(record.entryDate)) {
            logger.write(update(field, nonDuplicates[valueToDedup], record));
            nonDuplicates[valueToDedup] = record;
        //If the record doesn't already exist add it
        } else if(!nonDuplicates[valueToDedup]) {
            nonDuplicates[valueToDedup] = record;
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


const deduplicateRecords = async (file = "leads.json", ...args) => {
    try {
        const fields = args[0] ? args : ["_id", "email"];
        const data = await readFileAsync(file, "utf-8");
        const records = JSON.parse(data).leads;
        logger.write(logRecords("Initial Records", records));
        const deduplicatedRecords = multiDeduplicator(records, fields);
        logger.write(logRecords("Deduplicated Records", deduplicatedRecords));
        return { "leads": deduplicatedRecords };
    } catch(err) {
        console.log(err);
    }
}


deduplicateRecords(process.argv[2], ...process.argv.slice(3));