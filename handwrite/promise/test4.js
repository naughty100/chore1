const MyPromise = require('./index')

const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第一个完成'), 1000);
});

const promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第二个完成'), 500);
});

const promise3 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第三个完成'), 1500);
});

MyPromise.all([promise1, promise2, promise3])
    .then(values => {
        console.log(values); // 预期输出: ['第一个完成', '第二个完成', '第三个完成']
    })
    .catch(reason => {
        console.error(reason);
    });

const promise4 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第一个完成'), 1000);
});

const promise5 = new MyPromise((resolve, reject) => {
    setTimeout(() => reject('第二个失败'), 500);
});

const promise6 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve('第三个完成'), 1500);
});

MyPromise.all([promise4, promise5, promise6])
    .then(values => {
        console.log(values);
    })
    .catch(reason => {
        console.error(reason); // 预期输出: '第二个失败'
    });

MyPromise.all([])
.then(values => {
    console.log(values); // 预期输出: []
})
.catch(reason => {
    console.error(reason);
});