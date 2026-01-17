module.exports = {
  devServer: {
    open: true,
    host: 'localhost',
    port: 8000,
    proxy: {
      '/api': {
        target: 'https://api.hh17.top',
        changOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
