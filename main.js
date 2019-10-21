const exec = require('child_process').exec;
const fs = require('fs');

function main(params) {
    
    // Out with the old package...
    fs.unlinkSync('./package.json')
    
    // In with the new!
    fs.writeFileSync('./package.json', `{"name": "hello-world","version": "1.0.0","description": "","main": "index.js","keywords": [],"author": "","license": "ISC","dependencies": {"express": "^4.17.1"}}`);
    
    return new Promise( (resolve, reject) => {
            
            // Install dependencies
            exec('npm i', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(`err: ${error}`);
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                resolve();
            });
            
        })
        .then(result => {

            return new Promise( (resolve, reject) => {

                // Zip up installed dependencies
                exec('tar -zcvf deps.tar.gz ./node_modules', (error, stdout, stderr) => {

                    if (error) {
                        console.error(`exec error: ${error}`);
                        reject({err : error});
                    }
                    // And then pass them back to the user for download (not finished yet).
                    resolve({ data: fs.readFileSync('deps.tar.gz')});

                });

            });

        })
        .catch(err => {
            reject(err);
        })
    
    ;
    
}
