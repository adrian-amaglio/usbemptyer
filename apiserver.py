#!/usr/bin/python

import os, json
from bottle import route, run, template, get, post
from bottle.ext.websocket import GeventWebSocketServer, websocket
from geventwebsocket.exceptions import WebSocketError

# The global websockets to controll the web interface
w = None

# The dictionary containing all names. Not used yet.
# names = {
#   '04:00:7b:83:14:59' : {'':1, '':8, '':3},
#   '04:01:7b:83:14:59' : {'':4, '':9, '':5}
# }
names = {}

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
        print(message)
        name = json.loads(message)
        names[name['directory']] = name['name']
    except WebSocketError:
      print('Socket Error. Maybe a disconnection.')

######################### HTTP API #################################
@get('/end/<directory>')
def end(mac, usb, directory):
  send('end', directory)
  return names[directory] if directory in names else 'no'

@get('/start/<directory>')
def start(mac, usb, directory):
  send('start', directory)

@get('/file/<directory>/<filename>')
def file(mac, usb, directory, filename):
  send('file', directory, filename)

@get('/fail/<directory>/<message>')
def fail(mac, usb, directory, message):
  send('fail', directory, message)

run(host='localhost', port=49291, server=GeventWebSocketServer)
