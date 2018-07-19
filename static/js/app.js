window.onload = function (){
  app = new Vue({
		el:"main",
		data:{
      websocket: 0,
			api: "/api/1.0",
      files: [],
      infos: {},
      name_input: false,
      connected: {level:'danger', message:"Non connecté"},
      state: {level:'danger', message:"En attente de connection"},
		},
		created:function(){
      this.init_infos()
			this.websocket = new WebSocket('ws://localhost:49291/websocket')
      this.websocket.onopen  = (event) => {
          this.set_connected("success", "Connecté")
          this.set_state("info", "En attente d’un appareil")
      }
      this.websocket.onerror = (event) => {
        this.set_connected("danger", "Erreur")
        this.set_state("danger", "Erreur de communication. Ne pas recharger la page !")
      }
      this.websocket.onclose = (event) => {
        this.set_connected("danger", "Coupé")
        this.set_state("danger", "La communication a été coupée.")
      }
      this.websocket.onmessage = this.receive_ws
		},
		methods:{
      init_infos: function(d=''){
        this.infos = {directory:d, type:'', name:'', description:''}
        this.files = []
      },
      prompt_name: function(){
        this.name_input = true;
      },
      send_form: function(e){
        if (e.preventDefault) e.preventDefault()
        this.name_input = false
        this.set_state('info', 'Copie en cours')
        this.websocket.send(JSON.stringify(this.infos))
      },
      receive_ws(event){
        data = JSON.parse(event.data)
        console.log(data)
        switch(data.action){
          case 'start':
            this.init_infos(data.directory)
            this.prompt_name()
            this.set_state('info', 'Que contient l’appareil branché ?')
            break
          case 'file':
            this.files.push(data.info)
            break
          case 'end':
            this.set_state('success', 'La copie est terminée')
            break
          case 'fail':
            this.set_state('danger', 'La copie à échouée')
            break
          }
      },
      class_connected: function(){ return 'alert-'+this.connected.level },
      class_state:     function(){ return 'alert-'+this.state.level },
      set_state: function(level, content){
        this.state.level = level
        this.state.message = content
      },
      set_connected: function(level, content){
        this.connected.level = level
        this.connected.message = content
      },
    }
})

var form = document.getElementById('name-form');
if (form.attachEvent) {
    form.attachEvent("submit", app.send_form);
} else {
    form.addEventListener("submit", app.send_form);
}

}
