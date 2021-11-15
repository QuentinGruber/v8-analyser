import fs from "fs";

function buildHtml(funcObjs: any): Buffer {
  const header =
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">';
  const scripts =
    ' <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>';
  let body = "";

  let deoptCardList =
    '<h2>Deoptimized functions : </h2><br/><div class="d-flex flex-wrap">';
  let optCardList =
    '<h2>Optimized functions : </h2><br/><div class="d-flex flex-wrap">';
  Object.values(funcObjs).forEach((funcObj: any) => {
    if (funcObj.isDeoptimized) {
      const objCard = `
        <div class="card m-5">
            <div class="card-header">
                ${funcObj.name}
            </div>
            <div class="card-body">
                <p>Deoptimization type : ${funcObj.deoptimizationKind}</p>
                <p>Deoptimization reason : ${funcObj.deoptimizationReason}</p>
            </div>
        </div>
`;
      deoptCardList += objCard;
    } else {
      const objCard = `
        <div class="card m-5">
            <div class="card-header">
                ${funcObj.name}
            </div>
            <div class="card-body">
                <p>Optimization method :${funcObj.optimizationMethod}</p>
                <p>Optimization reason :${funcObj.markedReason}</p>
            </div>
        </div>
`;
      optCardList += objCard;
    }
  });

  deoptCardList += "</div><br/>";
  optCardList += "</div>";

  body += deoptCardList;

  body += optCardList;

  return Buffer.from(
    "<!DOCTYPE html>" +
      "<html><head>" +
      header +
      "</head><body>" +
      body +
      "</body>" +
      scripts +
      "</html>"
  );
}

export function writeJsonOutput(path: string,outputPath:string, data: any) {
  const funcCollectionJson = JSON.stringify(Object.values(data));
  const fullPath = `${path}/${outputPath?outputPath:"output.json"}`
  fs.writeFileSync(fullPath, funcCollectionJson);
  return fullPath;
}

export function writeHtmlOutput(path: string,outputPath:string, data: any):string {
  const funcCollectionHtml = buildHtml(data);
  const fullPath = `${path}/${outputPath?outputPath:"output.html"}`
  fs.writeFileSync(fullPath, funcCollectionHtml);
  return fullPath;
}
