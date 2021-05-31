const { execSync } = require('child_process');

const WARNING_TIME = 10 * 1000;

const cmd = command => {
  // toString sends error from process
  return execSync(command).toString();
};

const ms = mins => mins * 60 * 1000;

module.exports = {
  ms,
  cmd,
  WARNING_TIME,
};
