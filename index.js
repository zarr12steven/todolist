// 使用 node.js 內建的 http 模組
const http = require('http');
// 引用外部的 uuid 模組
const { v4: uuidv4, validate, version } = require('uuid');
const errorHandle = require('./errorHandle');
const todos = [];

// console.log(uuid);
// console.log(validate(uuid));
// console.log(version(uuid));

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }

  let body = "";
  req.on('data', chunk => {
    // console.log(chunk);
    body += chunk;
  })

  if (req.url == "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos
    }))
    res.end();
  } else if (req.url == "/todos" && req.method === "POST") {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        console.log(title);
        if (title !== undefined) {
          const todo = {
            "id": uuidv4(),
            "title": title
          }
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": todos
          }))
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    })
  } else if (req.url == "/todos" && req.method === "DELETE") {
    todos.length = 0; // 清空陣列
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos,
    }))
    res.end()
  } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    // 抓出 req.url 中的 uuid
    const id = req.url.split('/').pop();
    // 用 findIndex 找出符合條件的元素的索引值
    const index = todos.findIndex(element => element.id == id);
    console.log(index);
    // 如果有找到符合條件的元素，就刪除
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
        "data": todos,
      }))
      res.end();
    } else {
      errorHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method === "PATCH"){
    req.on('end', () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id == id);
        if ( todo !== undefined && index !== -1 ) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": todos,
          }))
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    })
    // res.writeHead(200, headers);
    // res.write(JSON.stringify({
    //   "status": "success",
    //   "data": todos,
    //   "method": "PATCH"
    // }))
    // res.end();
  } else if (req.url == "/todos" && req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      status: "false",
      message: "無此網站路由"
    }))
    res.end();
  }
}

const server = http.createServer(requestListener);
server.listen(8080);