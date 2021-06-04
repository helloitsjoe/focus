const { execSync } = require('child_process');

const cmd = command => {
  // toString sends error from process
  return execSync(command).toString();
};

const ms = mins => mins * 60 * 1000;

const timeLog = (...args) => console.log(new Date().toLocaleString(), ...args);

module.exports = {
  ms,
  cmd,
  timeLog,
};
