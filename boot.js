const fs = require('fs');
const fsp = fs.promises
const path = require('path');
const cp = require('child_process');

async function copy(source,target){
    const resolvedTarget = (await fsp.lstat(target)).isDirectory() ?
        path.join(target,path.basename(source)) : target;
    const file = await fsp.readFile(source);
    await fsp.writeFile(resolvedTarget,file);
    console.log('File copying','OK',source);
}

async function copyDir(source,target){
    const resolvedTarget = path.join(target,path.basename(source));
    if(!(await fs.existsSync(resolvedTarget)))
        await fsp.mkdir(resolvedTarget);
    if((await fsp.lstat(source)).isDirectory()){
        const files = await fsp.readdir(source);
        for(const file of files){
            const filePath = path.join(source,file);
            if((await fsp.lstat(filePath)).isDirectory())
                await copyDir(filePath,resolvedTarget);
            else await copy(filePath,resolvedTarget);
        }
    } else throw Error('given source is\'nt a directory');
}

async function installDependencies(){
    let include = (await fs.existsSync('../package.json')) ?
        '' : 'npm init -y &&';
    return new Promise((resolve,reject) => {
        cp.exec(`cd .. && ${include} npm install`, e => {
            if(e) reject(e);
            resolve();
        })
    })
}

(async ()=>{
    let code = 0
    try{
        await copyDir('./project_files/','../');
        console.log('File copying','FINISH');
    }catch(e){
        console.log('File copying','ERROR',e.message);
        code = 1
    }
    try{
        await installDependencies()
        console.log('Dependencies installation','FINISH');
    }catch(e){
        console.error('Dependencies installation','ERROR',e.message);
        code = 1;
    }
    if(!code) console.log(
        'Read https://github.com/play-curious/booyah/blob/master/README.md#production for the rest of the guide.'
    );
    process.exit(code);
})();