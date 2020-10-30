
export class BlockUIService {

    callback = null;

    constructor(callback) {
        this.callback = callback;
    }

    startBlock() {
        if(this.callback != null) {
            this.callback(true);
        }
    }

    stopBlock() {
        if(this.callback != null) {
            this.callback(false);
        }
    }
}