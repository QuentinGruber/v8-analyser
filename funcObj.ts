export class funcObj {
    id:string;
    name:string;
    isOptimized:boolean = false;
    executionOrder:string[] = [];
    markedReason!:string;
    compilationMethod!:string;
    optimizationMethod!:string;
    isDeoptimized:boolean = false;
    deoptimizationReason!:string;
    deoptimizationKind!:string;
    constructor(id:string){
        this.id = id;
    }
}