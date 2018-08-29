#!/usr/bin/python

import os, json, sys
from bottle import route, run, template, get, post
from bottle.ext.websocket import GeventWebSocketServer, websocket
from geventwebsocket.exceptions import WebSocketError

# The global websockets to controll the web interface
w = None
name = None

def send(action, directory, info=""):
  if w != None:
    w.send(json.dumps({"action":action, "directory":directory, "info":info}))
  else:
    print('Websocket is None. Can’t send anything.')

# Websocket connection
@get('/websocket', apply=[websocket])
def echo(ws):
  global w
  w = ws
  print('Connected ! '+str(w))
  while True:
    try:
      message = w.receive()
      if message is not None:
         name = message
    except WebSocketError:
      print('Socket Error. Maybe a disconnection.')
      break

######################### HTTP API #################################
@get('/end/<directory>')
def end(directory):
  send('end', directory)
  return name if name is not None else 'no'

@get('/start/<directory>')
def start(directory):
  name = None
  send('start', directory)

@get('/file/<directory>/<filename>')
def file(directory, filename):
  send('file', directory, filename)

@get('/fail/<directory>/<message>')
def fail(directory, message):
  send('fail', directory, message)

run(host='localhost', port=49291, server=GeventWebSocketServer)
