var http = require('http');
var fs = require('fs');
var url = require('url');
var qust = require('querystring');

function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      <a href="create">Create</a>
      ${body}
    </body>
  </html>`
}

function templatelist(filelist){
  var list = '<ul>';
  var i =0;

  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i++;
  }

  list = list + '</ul>';
  return list;
}

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url,true).query;
  var pathname = url.parse(_url, true).pathname;
    
 if(pathname ==='/'){ 
    if(queryData.id === undefined){
      fs.readdir('./data', function(error, filelist){
        var title = 'welcome';
        var description = 'Hello, Node.Js';
        var list = templatelist(filelist);
        var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
        response.end(template);
        response.writeHead(200);
        });
      }
      
    else {
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = templatelist(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
          response.end(template);
          response.writeHead(200);
          });
        });
      }

  } else if (pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - Create';
        var list = templatelist(filelist);
        var template = templateHTML(title, list, `
        <form action="http://localhost:3000/create_process" method="post">
          <p ><input type="text" name="title" placeholder="Title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `);
        response.writeHead(200);
        response.end(template);
        });

  } else if (pathname === '/create_process'){
    var body ='';
    request.on('data',function(data){
      body= body + data;
    });
    request.on('end', function(){
      var post = qust.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`,description, `utf8`,function(err){
        response.writeHead(302, {Location:`/?id=${title}`});
        response.end('success');
      })
      
    });
    

  } else {

    response.writeHead(404);
    response.end('Not found');   

    }
   

});
app.listen(3000)