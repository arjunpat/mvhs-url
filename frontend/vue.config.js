

module.exports = {
  outputDir: __dirname + '/../backend/public',
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugins.delete('prefetch');
  }
}
