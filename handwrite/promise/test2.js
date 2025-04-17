// 测试状态锁定
const p1 = new MyPromise((resolve) => {
    resolve(1)
    resolve(2) // 应该被忽略
})
p1.then(console.log) // 应该输出 1

// 测试值穿透
new MyPromise(resolve => resolve(100))
    .then()
    .then(v => console.log(v)) // 应该输出 100

// 测试错误捕获
new MyPromise(() => {
    throw new Error('test error')
}).catch(e => console.log(e.message)) // 应该输出 "test error"