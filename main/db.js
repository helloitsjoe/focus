const fs = require('fs');
const path = require('path');

const getDateTime = (date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const t = date.toLocaleTimeString('en-US', { hour12: false });

  return [y, m, d, t].join('-');
};

const saveTodos = todos => {
  // Just use one file, create new fill when over a certain size
  const dataPath = path.join(process.cwd(), 'data', `${getDateTime()}.json`);
  // if (fs.accessSync(dataPath)) {

  // }
  fs.writeFileSync(dataPath, JSON.stringify(todos));
};

const loadTodos = () => {
  // Get most recent file
  // return fs.readFileSync(dataPath)
};

module.exports = { saveTodos };
