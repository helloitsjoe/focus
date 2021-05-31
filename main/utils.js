const { execSync } = require('child_process');

const cmd = command => {
  return execSync(command).toString();
};

module.exports = {
  cmd,
};
