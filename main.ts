import { ChildProcess, spawn } from 'child_process';
import { Command } from 'commander';
import { funcObj } from './funcObj';


const program = new Command();
program
  .option('-p, --path <type>', 'Path to the script');
  program.parse(process.argv);
execProcess(program.opts().path)



function execProcess(path:string){
  const processId = setTimeout(()=>endProcess(ls,stringArray),5000);
  console.log("executing :"+path)
  const ls:ChildProcess = spawn('node', ['--trace-deopt','--trace-opt', path]);
  const stringArray:string[] = []
  
  ls.stdout.on('data', (data:Buffer) => {
    stringArray.push(data.toString())
  });
  
  ls.on('close', (code) => {
    clearTimeout(processId);
    console.log(`child process exited with code ${code}`);
    if(code)
      endProcess(ls,stringArray);
  });
}

function endProcess(ls:ChildProcess,stringArray:string[]){
  ls.kill('SIGINT')
  console.log(stringArray)
  parseStringToObjectJs(stringArray);
} 

function parseStringToObjectJs(stringArray:string[]){
  const funcCollection:any = {};
    for (let index = 0; index < stringArray.length; index++) {
      const line = stringArray[index];
      if(line[0] == "["){
        const v8Lines = line.split("\r\n")
        for (let index = 0; index < v8Lines.length - 1; index++) {
          const v8Line = v8Lines[index];
          const currentFunctionId = v8Line.split("(sfi = ")[1].split(")")[0];
          const operation = v8Line.split(" ")[0].substring(1);
          let currentFunction: funcObj;
          if(!funcCollection[currentFunctionId]){
            currentFunction = new funcObj(currentFunctionId);
            funcCollection[currentFunctionId] = currentFunction
          }
          funcCollection[currentFunctionId].executionOrder.push(operation)
          switch (operation) {
            case "marking":{
              funcCollection[currentFunctionId].markedReason = v8Line.split("reason: ")[1].split("]")[0];
              funcCollection[currentFunctionId].name = v8Line.split("<JSFunction ")[1].split(" (")[0];
              break;
            }
            case "compiling":{
              funcCollection[currentFunctionId].compilationMethod = v8Line.split(")> ")[1].split("]")[0];
              break;
            }
            case "optimizing":{
              funcCollection[currentFunctionId].optimizationMethod = v8Line.split(")> ")[1].split("]")[0];
              break;
            }
            case "completed":{
              funcCollection[currentFunctionId].isOptimized = true;
              break;
            }
            case "bailout":{
              console.log("bailout");
              funcCollection[currentFunctionId].isDeoptimized = true;
              funcCollection[currentFunctionId].deoptimizationReason = v8Line.split("reason: ")[1].split(")")[0];
              funcCollection[currentFunctionId].deoptimizationKind = v8Line.split("(kind: ")[1].split(",")[0];
              break;
            }
            default:
              break;
          }
        }
      }
    }
    console.log(funcCollection)
}