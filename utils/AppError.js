class AppError extends Error {
  constructor (message, stausCode) {
    super(message)

    this.statusCode = stausCode
    this.status = `$(statusCode)`.startsWith('4') ? 'fail' : 'error'
  }
}

module.exports = AppError
