const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT, () => {
    console.log('Ready on port', process.env.PORT);
  });
});