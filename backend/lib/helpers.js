const timeOffset = process.env.TIME_OFFSET_MS ? parseInt(process.env.TIME_OFFSET_MS) : 0;

module.exports = {
  getTime() {
    return Date.now() + timeOffset;
  }
}