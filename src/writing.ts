import fs from "fs";

function buildHtml(funcObjs: any):Buffer {
    const header = '';
    let body = '';
    
    Object.values(funcObjs).forEach((funcObj : any) => {

        const objCard = `<div>${funcObj.name}</div>`;

        body += objCard;
        
    });
    

    return Buffer.from('<!DOCTYPE html>'
         + '<html><head>' + header + '</head><body>' + body + '</body></html>');
};

export function writeJsonOutput(path:string,data:any){
    const funcCollectionJson = JSON.stringify(Object.values(data));
    if (path) {
      fs.writeFileSync(`${__dirname}/${path}.json`, funcCollectionJson);
    } else {
      fs.writeFileSync(`${__dirname}/output.json`, funcCollectionJson);
    }
  }


export function writeHtmlOutput(path: string, data: any) {
  
    const funcCollectionHtml = buildHtml(data);
    if (path) {
      fs.writeFileSync(`${__dirname}/${path}.html`, funcCollectionHtml);
    } else {
      fs.writeFileSync(`${__dirname}/output.html`, funcCollectionHtml);
    }
  }