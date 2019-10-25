const exec = require('child_process').exec;
const fs = require('fs');

function main(params) {
    
    const queryParams = {};
    
    params.__ow_query.split('&').forEach(pair => {
       const parts = pair.split('=');
       queryParams[parts[0]] = parts[1];
    });

    if(!queryParams.secret){
        
        return {
            headers : {
                "Content-Type" : "application/json"
            },
            statusCode : 401,
            body : {
                msg : "No secret token passed. Add ?secret=<YOUR SECRET HERE> to your invocation URL to enable this function."
            }
        };
        
    } else if(queryParams.secret === params.invocation_secret) {
        
        // Out with the old package...
        fs.unlinkSync('./package.json');

        // In with the new!        
        fs.writeFileSync('./package.json', Buffer.from(params.__ow_body, 'base64').toString('utf8') );

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
            .then(function(){

                return new Promise( (resolve, reject) => {

                    // Zip up installed dependencies
                    exec('tar -zcvf deps.tar.gz ./node_modules', (error, stdout, stderr) => {

                        if (error) {
                            console.error(`exec error: ${error}`);
                            reject({err : error});
                        }
                        // And then pass them back to the user for download.
                        resolve({
                            headers : {
                                'Content-Type' :  'application/octet-stream',
                                "Content-Disposition": "attachment;filename=deps.tar.gz"
                            },
                            statusCode : 200,
                            body  : fs.readFileSync('deps.tar.gz').toString('base64')
                        });

                    });

                });

            })
            .catch(err => {
                return Promise.reject(err);
            })

        ;
        
    } else {
        
        return {
            headers : {
                "Content-Type" : "application/json"
            },
            statusCode : 401,
            body : {
                msg : "Incorrect invocation secret passed."
            }
        }
        
    }

}
