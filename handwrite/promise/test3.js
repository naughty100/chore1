const MyPromise = require('./index')

const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第一个完成'), 1000);
});

const promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第二个完成'), 2000);
});

MyPromise.race([promise1, promise2])
    .then(value => {
        debugger
        console.log(value); // 预期输出: '第一个完成'
    })
    .catch(reason => {
        debugger
        console.error(reason);
    });


// const promise3 = new MyPromise((resolve, reject) => {
//     setTimeout(() => reject('第一个失败'), 500);
// });

// const promise4 = new MyPromise((resolve, reject) => {
//     setTimeout(() => resolve('第二个完成'), 1000);
// });

// MyPromise.race([promise3, promise4])
//     .then(value => {
//         debugger
//         console.log(value);
//     })
//     .catch(reason => {
//         debugger
//         console.error(reason); // 预期输出: '第一个失败'
//     });

// const promise5 = new MyPromise((resolve, reject) => {
//     setTimeout(() => resolve('第一个完成'), 1000);
// });

// const promise6 = new MyPromise((resolve, reject) => {
//     setTimeout(() => resolve('第二个完成'), 1000);
// });

// MyPromise.race([promise5, promise6])
//     .then(value => {
//         console.log(value); // 预期输出: '第一个完成' 或 '第二个完成'
//     })
//     .catch(reason => {
//         console.error(reason);
//     });