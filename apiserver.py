#!/usr/bin/python

import os, json
from bottle import route, run, template, get, post
from bottle.ext.websocket import GeventWebSocketServer
from bottle.ext.websocket import websocket

# The global websocket to controll the web interface
w = None

def send(action, directory, info=""):
  if w != None:
    w.send(json.dumps({"action":action, "directory":directory, "info":info}))
  else:
    print('Websocken is None. Can’t send anything.')

# Websocket connection
@get('/websocket', apply=[websocket])
def echo(ws):
  w = ws

# HTTP API
@route('/end/<directory>')
def end(directory):
  w.send('end', directory)

@post('/start/<directory>')
def start(directory):
  send('start', directory)

@route('/file/<directory>/<filename>')
def file(directory, filename):
  send('file', directory, filename)

@get('/fail/<directory>/<message>')
def fail(directory, message):
  send('fail', directory, message)

run(host='localhost', port=49291, server=GeventWebSocketServer)
