const fs = require("fs");

const readFileAsync = (file, format) => {
    return new Promise((resolve, reject) => {
        return fs.readFile(file, format, (err, data) => {
            if(err) reject(err);
            resolve(data);
        })
    })
}

module.exports = readFileAsync;