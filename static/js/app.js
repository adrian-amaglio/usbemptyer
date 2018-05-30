window.onload = function (){
  app = new Vue({
		el:"main",
		data:{
      websocket: 0,
			api: "/api/1.0",
      directory: "",
      name: "",
      type: "",
      description: "",
      files: [],
      name_input: false,
      connected: "Not connected",
		},
		created:function(){
			this.websocket = new WebSocket('ws://localhost:49291/websocket')
      this.websocket.onopen  = (event) => { this.connected = "Connected" }
      this.websocket.onerror = (event) => { this.connected = "Error" }
      this.websocket.onclose = (event) => { this.connected = "Closed" }
      this.websocket.onmessage = this.receive_ws
		},
		methods:{
      prompt_name: function(){
        this.name_input = true;
      },
      send_form: function(e){
        if (e.preventDefault) e.preventDefault();
        this.name_input = false
        this.websocket.send(JSON.stringify({"directory":this.directory, "name": this.name +'-'+ this.type +'-'+ this.description}))
        this.message('sucess', 'Form sent')
      },
      message: function(level, content){
        if (level != 'futile') {
          alert(content)
          content = ' -- ' + content + ' -- '
        }
        this.files.push(content)
      },
      receive_ws(event){
        data = JSON.parse(event.data)
        console.log(data)
        switch(data.action){
          case 'start':
            this.name = ""
            this.type = ""
            this.description = ""
            this.files = []
            this.directory = data.directory
            this.prompt_name()
            break
          case 'file':
            this.message('futile', data.info)
            break
          case 'end':
            this.message('success', 'Copy completed')
            break
          case 'fail':
            this.message('danger', 'Copy failed')
            break
          }
      }
    }
})

var form = document.getElementById('name-form');
if (form.attachEvent) {
    form.attachEvent("submit", app.send_form);
} else {
    form.addEventListener("submit", app.send_form);
}

}
