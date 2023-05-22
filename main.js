/*-----------------------------------------------------------------------------------------------------------\
|  _____     _   _____ _             _ _          _____  _____  _____  __      _______  _____  _____  _____  |
| |_   _|   (_) /  ___| |           | (_)        / __  \|  _  |/ __  \/  |    / / __  \|  _  |/ __  \|____ | |
|   | | __ _ _  \ `--.| |_ _   _  __| |_  ___    `' / /'| |/' |`' / /'`| |   / /`' / /'| |/' |`' / /'    / / |
|   | |/ _` | |  `--. \ __| | | |/ _` | |/ _ \     / /  |  /| |  / /   | |  / /   / /  |  /| |  / /      \ \ |
|   | | (_| | | /\__/ / |_| |_| | (_| | | (_) |  ./ /___\ |_/ /./ /____| |_/ /  ./ /___\ |_/ /./ /___.___/ / |
|   \_/\__,_|_| \____/ \__|\__,_|\__,_|_|\___/   \_____/ \___/ \_____/\___/_/   \_____/ \___/ \_____/\____/  |
\-----------------------------------------------------------------------------------------------------------*/

const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

try {
    const type = core.getInput('type');
    const files = core.getInput('files');
    const replace = core.getInput('replace');
    const replaceFor = core.getInput('replaceFor');

    switch(type){
        case 'single':
            single(files, replace, replaceFor);
            break;
        case 'multiple':
            multiple(files, replace, replaceFor);
            break;
        default:
            single(files, replace, replaceFor);

    }
} catch (error) {
    core.setFailed(error.message);
}

function single(files, replace, replaceFor){
    if(typeof files == "object"){
        multiple(files, replace, replaceFor);
    }
    else{
        editor(files, replace, replaceFor);
    }
}

function multiple(files, replace, replaceFor){
    if(typeof files == "string"){
        single(files, replace, replaceFor);
    }
    else{
        files.forEach(file => {
            single(file, replace, replaceFor);
        });
    }
}

function editor(file, strPARAM, find, replace){
    file = path.join(process.env.RUNNER_WORKSPACE, file);
    console.log(file, process.env.RUNNER_WORKSPACE);
    console.log(process.env);
    try {
        const doc = yaml.load(fs.readFileSync(file, 'utf8'));
        doc['files'][0]['url'] = replaceALL(strPARAM, find, replace);
        doc['path'] = replaceALL(strPARAM, find, replace);
        var newFile = yaml.dump(doc);
        fs.writeFileSync(file, newFile, 'utf8');
    } catch (e) {
        console.log(e);
    }
}

function replaceALL(str, find, replace) {
    var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}