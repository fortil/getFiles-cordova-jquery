'use strict'

var express = require('express')
var app = express()
var cors = require('cors')

app.use(cors())

app.get('/', function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.json(js);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

var js = {
  "version": "1.0.0",
  "files":[ 
    {
    "name": "file1",
    "route": "/fp/3-p63-Rivadera.pdf",
    },
    {
    "name": "file2",
    "route": "/fp/funcional-diapos.pdf",
    },
    {
    "name": "file3",
    "route": "/fp/3-p63-Rivadera_2.pdf",
    },
  ]
}