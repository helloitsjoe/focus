const { cmd } = require('./utils');
const cron = require('node-cron');

const startJob = ({ app, bg = false } = {}) => {
  console.log(`Starting ${app}`);
  const command = `osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`;
  // const command = `echo "Running ${app}${bg ? ' in the background' : ''}..."`

  cmd(command);
  const task = cron.schedule('*/10 * * * * *', () => {
    console.log(`activating ${app}...`);
    cmd(command);
  });

  task.start();
  return task;
};

module.exports = startJob;
