const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

module.exports = class MyPromise {
    constructor(fn) {
        this.status = PENDING
        this.value = null
        this.reason = null
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        try {
            fn(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error)
        }
    }

    resolve(value) {
        if (this.status !== PENDING) return
        this.status = FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach(callback => {
            setTimeout(() => callback(this.value), 0)
        })
    }

    reject(reason) {
        if (this.status !== PENDING) return
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallbacks.forEach(callback => {
            setTimeout(() => callback(this.reason), 0)
        })
    }

    then(onFulfilled, onRejected) {
        const newPromise = new MyPromise((resolve, reject) => {
            const handleFulfilled = () => {
                try {
                    const x = typeof onFulfilled === 'function' 
                        ? onFulfilled(this.value) 
                        : this.value
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
            }

            const handleRejected = () => {
                try {
                    const x = typeof onRejected === 'function'
                        ? onRejected(this.reason)
                        : this.reason
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
            }

            if (this.status === FULFILLED) {
                setTimeout(handleFulfilled, 0)
            } else if (this.status === REJECTED) {
                setTimeout(handleRejected, 0)
            } else {
                this.onFulfilledCallbacks.push(handleFulfilled)
                this.onRejectedCallbacks.push(handleRejected)
            }
        })
        
        return newPromise
    }

    catch(onRejected){
        return this.then(null,onRejected)
    }

    finally(onFinally) {
        return this.then(
            value => {
                onFinally();
                return value;
            },
            reason => {
                onFinally();
                throw reason;
            }
        );
    }

    static race(promises){
        return new MyPromise((resolve,reject)=>{
            promises.forEach(promise=>{
                promise.then(value=>{
                    resolve(value)
                },reason=>{
                    reject(reason)
                })
            })
        })
    }

    static all(promises){
        return new MyPromise((resolve,reject)=>{
            const results = new Array(promises.length)
            let completed = 0;

            if(promises.length === 0){
                resolve([])
                return
            }

            promises.forEach((promise,index)=>{
                promise.then(value=>{
                    results[index] = value;
                    completed++;
                    if(completed === promises.length){
                        resolve(results)
                    }
                },reason=>{
                    reject(reason)
                })
            })
                
        })
    }
}