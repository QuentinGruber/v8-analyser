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
} 

function parseStringToObjectJs(stringArray:string[]){
    for (let index = 0; index < stringArray.length; index++) {
      const line = stringArray[index];
      
    }
}