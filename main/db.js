const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, `todos.json`);

const getDateTime = (date = new Date()) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const t = date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  return [y, m, d, t].join('-');
};

const saveTodos = todos => {
  // Just use one file, create new file when over a certain size, or start deleting old entries

  try {
    fs.accessSync(dataFile);
  } catch (e) {
    fs.mkdirSync(dataDir);
    fs.writeFileSync(dataFile, '{}');
  }

  const data = JSON.parse(fs.readFileSync(dataFile).toString());
  // TODO: Append to file
  fs.writeFileSync(
    dataFile,
    JSON.stringify({ ...data, [getDateTime()]: todos })
  );
  console.log('Saved!');
};

const loadTodos = () => {
  try {
    const todos = JSON.parse(fs.readFileSync(dataFile).toString());
    const todosArr = Object.values(todos);
    return todosArr[todosArr.length - 1];
  } catch (e) {
    console.log('No saved todos');
    return [];
  }
};

module.exports = { saveTodos, loadTodos };
