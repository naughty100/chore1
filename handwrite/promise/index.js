
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

export const MyPromise = class {
    constructor(fn) {
        this.status = PENDING
        this.value = null
        this.reason = null
        this.onFulfilledCallbacks=[]
        this.onRejectedCallbacks=[]

        fn(this.resolve.bind(this),this.reject.bind(this))
    }

    resolve(value){
        if(this.status === PENDING){
            this.status = FULFILLED
            this.value = value
            this.onFulfilledCallbacks.forEach(callback=> {
                setTimeout(()=>{
                    callback(value)
                },0)
            })
        }
    }


    reject(reason){
        if(this.status === PENDING){
            this.status = REJECTED
            this.reason = reason
            this.onRejectedCallbacks.forEach(callback=> {
                setTimeout(()=>{
                    callback(reason)
                },0)
            })
        }
    }

    then(onFulfilled,onRejected){
        return new MyPromise((resolve,reject)=>{
            const handleFulfilled = value => {
                if(typeof onFulfilled !== 'function'){
                    resolve(onFulfilled(value))
                }else {
                    reject(value)
                }
            }

            const handleRejected = reason => {
                if(typeof onRejected !== 'function'){
                    reject(onRejected(reason))
                }else {
                    reject(reason)
                }
            }

            if(this.status === PENDING){
                this.onFulfilledCallbacks.push(handleFulfilled)
                this.onRejectedCallbacks.push(handleRejected)
            }

            if(this.status === FULFILLED){
                setTimeout(()=>{
                    const result = handleFulfilled(this.value)
                    resolve(result)
                },0)

            }

            if(this.status === REJECTED){
                setTimeout(()=>{
                    const result = handleRejected(this.reason)
                    resolve(result)
                },0)
            }
        })
    }

    catch(onRejected){
        return this.then(null,onRejected)
    }

    finally(onFinally){
        return this.then(onFinally,onFinally)
    }
}
