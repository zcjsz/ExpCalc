const ExpCalc = require('./ExpCalc');
let exp = '-3* -(-2.1 *(12 - 5.8+ 7.5)) -6 /- 1.6 -11 ';
let expCalc = new ExpCalc();
console.log(exp);
expCalc.set(exp).trim().print();
expCalc.set(exp).trim().minus().print();
expCalc.set(exp).trim().minus().segment().printSeg();
expCalc.set(exp).trim().minus().segment().toRpn().printRpnSeg();
expCalc.set(exp).trim().minus().segment().toRpn().calRpn().printResult();
console.log(expCalc.set(exp).calc());
