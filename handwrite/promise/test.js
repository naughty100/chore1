const MyPromise = require('./index')

// 测试用例 1: 基本功能
const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('成功'), 1000);
});

promise1.then((value) => {
    console.log(value); // 应该输出 "成功"
});

// 测试用例 2: 错误处理
const promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => reject('失败'), 1000);
});

promise2.catch((reason) => {
    console.log(reason); // 应该输出 "失败"
});

// 测试用例 3: 链式调用
const promise3 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000);
});

promise3
    .then((value) => {
        console.log(value); // 应该输出 1
        return value + 1;
    })
    .then((value) => {
        console.log(value); // 应该输出 2
        return value + 1;
    }).then((value)=>{
        console.log(value); // 应该输出 3
    });

// 测试用例 4: finally
const promise4 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('finally'), 1000);
});

promise4
    .finally(() => {
        console.log('finally 执行'); // 应该输出 "finally 执行"
    })
    .then((value) => {
        console.log(value); // 应该输出 "finally"
    });