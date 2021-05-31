const { execSync } = require('child_process');

const cmd = command => {
  // toString sends error from process
  return execSync(command).toString();
};

module.exports = {
  cmd,
};
