import { cmd } from './utils';

export const activate = ({ bg, app }) =>
  cmd(`osascript -e '${bg ? 'launch' : 'activate'} app "${app}"'`);

export const quit = app => cmd(`osascript -e 'quit app "${app}"'`);
