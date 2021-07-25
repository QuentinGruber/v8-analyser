import { ChildProcess, spawn } from 'child_process';
import { Command } from 'commander';
const program = new Command();
program
  .option('-p, --path <type>', 'Path to the script');
  program.parse(process.argv);
  console.log(program.opts())
execProcess(program.opts().path)



function execProcess(path:string){
  console.log(path)
  const ls:ChildProcess = spawn('node', ['--trace-deopt','--trace-opt', path]);
  const stringArray:string[] = []
  
  ls.stdout.on('data', (data:Buffer) => {
    stringArray.push(data.toString())
  });
  
  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
  setTimeout(()=>endProcess(ls,stringArray),5000)
}

function endProcess(ls:ChildProcess,stringArray:string[]){
  ls.kill('SIGINT')
  console.log(stringArray)
  parseStringToObjectJs(stringArray);
} 

function parseStringToObjectJs(stringArray:string[]){
  const objectArray = [];
    for (let index = 0; index < stringArray.length; index++) {
      const line = stringArray[index];
      if(line[0] == "["){
        const v8Lines = line.split("\r\n")
        for (let index = 0; index < v8Lines.length - 1; index++) {
          const v8Line = v8Lines[index];
          const currentFunctionId = v8Line.split("(sfi = ")[1].split(")")[0];
          const operation = v8Line.split(" ")[0].substring(1);
          switch (operation) {
            case "compiling":
              
              break;
            case "optimizing":
              objectArray.push({operation:"optimizing",sfi:currentFunctionId})
              break;
            default:
              break;
          }
        }
      }
    }
    console.log(objectArray)
}