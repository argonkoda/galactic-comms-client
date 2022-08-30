const path = require('node:path');
const { resourceLimits } = require('node:worker_threads');

module.exports = {
  packagerConfig: {
    dir: "dist",
    ignore: (filePath) => {
      const include = ["", "/", "/dist", "/package.json", "/package-lock.json"]
      const result = !(include.includes(filePath) || filePath.startsWith('/dist'));
      return result;
    }
  },
  makers: [
    {
      name: "@electron-forge/maker-zip"
    }
  ]
}