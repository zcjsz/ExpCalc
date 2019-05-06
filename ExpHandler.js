class ExpHandler {

    constructor(exp){
        this.exp = exp;
        this.expSeg = [];
        this.rpn = '';
        this.rpnSeg = [];
        this.result = '';
        this.valid = true;
    }

    print() {
        console.log(this.exp);
    }

    printSeg() {
        console.log(this.expSeg.toString());
    }

    printRpn() {
        console.log(this.rpn);
    }

    printRpnSeg() {
        console.log(this.rpnSeg.toString());
    }

    printResult() {
        console.log(this.result.toString());
    }

    get() {
        return this.exp;
    }

    getSeg() {
        return this.expSeg;
    }

    getRpn() {
        return this.rpn;
    }

    getRpnSeg() {
        return this.rpnSeg;
    }

    getResult() {
        return this.result;
    }

    set(exp) {
        this.exp = exp;
        return this;
    }

    setRPN(rpn) {
        this.rpn = rpn;
        return this;
    }

    isValid() {
        return this.valid;
    }

    //去除表达式里面的空格
    trim() {
        this.exp = this.exp.replace(new RegExp('\\s',"gm"),'');
        return this;
    }

    //表达式负号处理，根据'-'判断是否为负号
    //1. 首字符作为负号
    //2. 左括号后面作为负号
    //3. 除了右括号和数字，其他字符后面都作为负号
    minus() {
        let out = [];
        let alter = '#';
        for(let i=0; i<this.exp.length; i++) {
            if(this.exp[i]==='-') {
                if(i===0) {
                    out.push(alter);
                } else if(this.exp[i-1]==='(') {
                    out.push(alter);
                } else if(this.exp[i-1]!==')' && isNaN(this.exp[i-1])) {
                    out.push(alter);
                } else {
                    out.push('-');
                }
            } else {
                out.push(this.exp[i]);
            }
        }
        this.expSeg = out;
        this.exp = this.expSeg.join('');
        return this;
    }

    //表达式分词
    segment() {
        let tmp = [];
        let out = [];
        for(let i=0; i<this.exp.length; i++) {
            if(['+','-','*','/','(',')','#'].indexOf(this.exp[i])>-1) {
                if(tmp.length>0) {
                    out.push(tmp.join(''));
                    tmp.length = 0;
                }
                out.push(this.exp[i])
            } else {
                tmp.push(this.exp[i]);
            }
        }
        if(tmp.length>0) {
            out.push(tmp.join(''));
        }
        this.expSeg = out;
        this.exp = this.expSeg.join('');
        return this;
    }

    // 中缀表达式转后缀表达式
    toRpn() {
        let stack = [];
        let out = [];
        let temp = '';
        for(let i=0; i<this.expSeg.length; i++) {
            let str = this.expSeg[i];
            switch(str) {
                case '(':
                    stack.push(str);                     // 左括号直接入栈
                    break;
                case '+':
                case '-':
                    while(stack.length>0) {              // 出栈规则:
                        temp = stack[stack.length-1];    // 规则1. 只要当前栈顶运算符的优先级大于或是等于待处理运算符，栈顶运算符就可以出栈，放到输出队列
                        if(temp === '(') break;          // 规则2. 只有碰到右括号，左括号就停止出栈
                        out.push(stack.pop());           // 因为加减号优先级最低，所以碰到加减号可以弹出除左括号以外的所有运算符(加减乘除)
                    }
                    stack.push(str);                     // 将待处理运算符入栈
                    break;
                case '*':
                case '/':
                    while(stack.length>0) {
                        temp = stack[stack.length-1];                // 栈顶元素
                        if(['(','+','-'].indexOf(temp)>-1) break;    // 如果待处理运算符是加减号，优先级低，不能出栈。未碰到右括号，左括号不能出栈。
                        out.push(stack.pop());                       // 乘除号和井字号可以出栈，放到输出队列
                    }
                    stack.push(str);                                 // 待处理运算符入栈
                    break;
                case '#':
                    while(stack.length>0) {
                        temp = stack[stack.length-1];
                        if(['(','+','-','*','/'].indexOf(temp)>-1) break;    // 如果待处理运算符是加减乘除，优先级设定比井字号低，不能出栈。未碰到右括号，左括号不能出栈。
                        out.push(stack.pop());                               // 井字号可以出栈，放到输出队列
                    }
                    stack.push(str);                                         // 待处理运算符入栈
                    break;
                case ')':
                    while(stack.length>0) {
                        temp = stack[stack.length-1];
                        if(temp === '(') {                                   // 碰到右括号时候，将靠近栈顶的第一个左括号上面的运算符全部依次弹出，送至输出队列后
                            stack.pop();                                     // 同时丢弃这个左括号，待处理的右括号也丢弃
                            break;
                        }
                        out.push(stack.pop());
                    }
                    break;
                default:                                                     // 除了上面那些运算符和左右括号，剩下的都认为是有效数字
                    if(ExpHandler.REG_NUMBER.test(str)) {
                        out.push(str);                                       // 有效数字都放到输出队列
                    } else {
                        this.valid = false;
                        out.push(str);
                    }
            }
            if(this.valid === false) break;
        }

        if(stack.length>0){
            const stackLen = stack.length;
            for(let j=0; j<stackLen; j++) {
                out.push(stack.pop());
            }
        }

        this.rpnSeg = out;
        this.rpn = this.rpnSeg.join('');
        return this;
    }

    //后缀表达式计算
    calRpn() {
        if(!this.valid) return;
        let stack = [];
        let reg = /^[0-9]+\.?[0-9]*$/;
        for(let i=0; i<this.rpnSeg.length; i++) {
            if(reg.test(this.rpnSeg[i])) {
                stack.push(parseFloat(this.rpnSeg[i]));
            } else {
                let x,y;
                switch(this.rpnSeg[i]) {
                    case '+': y=stack.pop();  x=stack.pop();  stack.push(x+y);  break;
                    case '-': y=stack.pop();  x=stack.pop();  stack.push(x-y);  break;
                    case '*': y=stack.pop();  x=stack.pop();  stack.push(x*y);  break;
                    case '/': y=stack.pop();  x=stack.pop();  stack.push(x/y);  break;
                    case '#': y=stack.pop();  x=0;            stack.push(x-y);  break;
                    default: break;
                }
            }
        }
        if(stack.length===1 && ExpHandler.REG_NUMBER.test(stack[0])) {
            this.result = stack[0];
        } else {
            this.valid = false;
            this.result = stack;
        }
        return this;
    }

    calc(exp) {
        if(exp) {
            set(exp).trim().minus().segment().toRpn().calRpn();
        } else {
            this.trim().minus().segment().toRpn().calRpn();
        }
        if(this.valid) {
            return this.result;
        } else {
            return void 0;
        }
    }
}




//表达式括号匹配判断



ExpHandler.REG_NUMBER = /^(\+|-)?[0-9]+\.?[0-9]*$/;

module.exports = ExpHandler;
