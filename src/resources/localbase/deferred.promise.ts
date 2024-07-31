/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper for promise management
 */
export class DeferredPromise<T> {
    promise: Promise<T>;
    resolved = false;
    resolve: (value: T | Promise<T>) => void;
    reject: (e: any) => void;
    constructor() {
        let pResolve: (v: T | Promise<T>) => void;
        let pReject: (r: any) => void;
        this.resolve = (v: T | Promise<T>) => {
            this.resolved = true;
            pResolve(v);
        };
        this.reject = (r: any) => {
            this.resolved = true;
            pReject(r);
        };
        this.promise = (new Promise<T>((resolve, reject) => {
            pResolve = resolve;
            pReject = reject;
        }));
    }
}   