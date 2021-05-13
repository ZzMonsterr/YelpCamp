class ExpressError extends Error {
    constructor(message, statusCode) {
        // call the Error code
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;