import { ChildProcess, spawn } from "child_process";
import { Command } from "commander";
import { funcObj } from "./funcObj";
import { writeHtmlOutput, writeJsonOutput } from "./writing";

const program = new Command();
program
  .option("-p, --path <type>", "Path to the script")
  .option("-o, --output <type>", "Path to the output file")
  .option("-d , --debug", "Debug mode")
  .option("-do , --deopt-only", "Render deopt only")
  .option("-oo , --opt-only", "Render opt only")
  .option("-e, --exec-json", "Render in a html a previously done json output")
program.parse(process.argv);
console.log(program.opts());
if (program.opts().execJson) {
  throw "unimplemented";
} else {
  const pathFromOpt = program.opts().path;
  execProcess(pathFromOpt?pathFromOpt:".");
}

function execProcess(path: string) {
  console.log("executing :" + path);
  const spawnArgs = [];
  if (!program.opts().optOnly) {
    spawnArgs.push("--trace-deopt");
  }
  if (!program.opts().deoptOnly) {
    spawnArgs.push("--trace-opt");
  }
  spawnArgs.push(path);
  const ls: ChildProcess = spawn("node", spawnArgs);
  const stringArray: string[] = [];

  ls.stdout?.on("data", (data: Buffer) => {
    stringArray.push(data.toString());
  });

  ls.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code) endProcess(ls, stringArray);
  });
  process.on("SIGINT", function () {
    console.log("Caught interrupt signal on main");
    endProcess(ls, stringArray);
  });
}

function endProcess(ls: ChildProcess, stringArray: string[]) {
  ls.kill("SIGINT");
  parseStringToObjectJs(stringArray);
}



function parseStringToObjectJs(stringArray: string[]) {
  const funcCollection: any = {};
  for (let index = 0; index < stringArray.length; index++) {
    const line = stringArray[index];
    const v8Lines = line.split("\r\n");
    for (let index = 0; index < v8Lines.length - 1; index++) {
      const v8Line = v8Lines[index];
      const deoptimizing =
        v8Line.includes("deoptimization") || v8Line.includes("deoptimizing");
      const currentFunctionId = v8Line.split("(sfi = ")[1]?.split(")")[0];
      const operation = v8Line.split(" ")[0].substring(1);
      let currentFunction: funcObj;
      if (!funcCollection[currentFunctionId]) {
        currentFunction = new funcObj(currentFunctionId);
        funcCollection[currentFunctionId] = currentFunction;
      }
      if (program.opts().debug) {
        funcCollection[currentFunctionId].debugLine = v8Line;
      }
      funcCollection[currentFunctionId].executionOrder.push(operation);
      switch (operation) {
        case "marking": {
          if (deoptimizing) {
            continue;
            const currentSpecialFunctionId = v8Line
              .split("(")[1]
              ?.split(" ")[0];
            funcCollection[currentSpecialFunctionId].markedReason = v8Line
              .split("reason: ")[1]
              .split("]")[0];
            funcCollection[currentSpecialFunctionId].name = v8Line
              .split("<SharedFunctionInfo ")[1]
              .split(" >")[0];
          } else {
            funcCollection[currentFunctionId].markedReason = v8Line
              .split("reason: ")[1]
              .split("]")[0];
            funcCollection[currentFunctionId].name = v8Line
              .split("<JSFunction ")[1]
              .split(" (")[0];
          }
          break;
        }
        case "compiling": {
          funcCollection[currentFunctionId].compilationMethod = v8Line
            .split(")> ")[1]
            .split("]")[0];
          break;
        }
        case "optimizing": {
          funcCollection[currentFunctionId].optimizationMethod = v8Line
            .split(")> ")[1]
            .split("]")[0];
          break;
        }
        case "completed": {
          funcCollection[currentFunctionId].isOptimized = true;
          break;
        }
        case "bailout": {
          funcCollection[currentFunctionId].isDeoptimized = true;
          funcCollection[currentFunctionId].name = v8Line
            .split("<JSFunction ")[1]
            .split(" (")[0];
          funcCollection[currentFunctionId].name =
            funcCollection[currentFunctionId].name.length > 30
              ? "Anonymous"
              : funcCollection[currentFunctionId].name;
          funcCollection[currentFunctionId].deoptimizationReason = v8Line
            .split("reason: ")[1]
            .split(")")[0];
          funcCollection[currentFunctionId].deoptimizationKind = v8Line
            .split("(kind: ")[1]
            .split(",")[0];
          break;
        }
        default:
          break;
      }
    }
  }
  console.log(funcCollection);
  const outputPath = program.opts().output;
  writeJsonOutput(outputPath,funcCollection);
  writeHtmlOutput(outputPath,funcCollection);
}


