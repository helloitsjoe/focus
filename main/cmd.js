const { cmd } = require('./utils');

const activate = ({ bg, app }) =>
  cmd(`osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`);

const quit = app => cmd(`osascript -e 'quit app "${app}"'`);

module.exports = { activate, quit };
