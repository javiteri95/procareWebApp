import Navbar from './../../components/navbar.vue';
import Materials from 'vue-materials';
Vue.component('navbar', Navbar); 
Vue.use(Materials);


var app = new Vue({
	el: '#asistenciasApp',
	data: {
    generoSel: '',
		grupos: [],
    gruposAux: [],
		grupoSel: {},
		fechaSel:'',
    chicos: [],
    asistencias: [],
    faltas: [],
    justificadas: []
	},
  created(){
    this.obtenerGrupos(this);
  },
	mounted(){
    this.inicializarDOM(this);
	},
	methods: {
    inicializarDOM(self){
      $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 100 // Creates a dropdown of 50 years to control year
      });
      $(".button-collapse").sideNav();
      $('.modal').modal();

      $('#selectGrupos').prop('disabled', true);
      $('#fechaAsistencia').prop('disabled', true);
      $('#rowResultados').css('display', 'none');
      $('#rowBotones').css('display', 'none');

      $('#genero').change(function(){
        self.filtrarGrupos(self);
        $('#selectGrupos').prop('disabled', false);
      });

      $('#selectGrupos').change(function(){
        let idGrupo = $('#selectGrupos option:selected').val();
        self.obtenerGrupoSeleccionado(self, idGrupo);
        $('#fechaAsistencia').prop('disabled', false);
      });

      $('#fechaAsistencia').change(function(){
        self.validarFechaAsistencia(self);
      });
    },
    /*
      @Descripción: Filtra los grupos a mostrar en el select por el género seleccionado
    */
    filtrarGrupos(self){
      self.grupos = [];
      self.grupos = self.gruposAux;
      let genero = $('#genero option:selected').val();
      self.grupos = $.grep(self.grupos, function(grupo, index){
        return grupo.genero === genero;
      });
    },
    /*
      @Descripción: Valida que la fecha ingresada sea correcta dependiendo del grupo seleccionado.
    */
    validarFechaAsistencia(self){
      let fechaSeleccionada = new Date($('#fechaAsistencia').val());
      let diaSeleccionado = fechaSeleccionada.getDay();
      let jueves = 4;
      let martes = 2;
      let generoSeleccionado = self.generoSel;
      let fechaProcare = (diaSeleccionado === jueves) && (generoSeleccionado === 'Procare');
      let fechaProcareMujeres = (diaSeleccionado === martes) && (generoSeleccionado === 'Procare Mujeres');
      let fechaCorrecta = ( fechaProcare ||  fechaProcareMujeres);

      if( fechaCorrecta ){
        self.fechaSel = fechaSeleccionada;
        $('#rowResultados').css('display', 'block');
        $('#rowBotones').css('display', 'block');
        self.inicializarRadioButtons(self);
      }else{
        $('#modalDia').modal('open');
        $('#fechaAsistencia').val("");
        self.fechaSel = '';
        $('#rowResultados').css('display', 'none');
        $('#rowBotones').css('display', 'none');
      }
    },
    /*
      @Descripción: Marca todos los radio buttons de asistencias como:  Asistió
    */
    inicializarRadioButtons(self){
      let idRadioAsistencia = '';
      $.each(self.chicos, function(index, chico){
        idRadioAsistencia = '#asist-' + chico.id;
        $(idRadioAsistencia).attr('checked', 'checked');
      });
    },
    /*
      @Descripción: Obtiene todos los grupos de la base de datos
    */
    obtenerGrupos(self){
      $.ajax({
        type: 'GET',
        url: '/api/grupos/',
        success(res){
          self.armarArrayGrupos(self, res.sequelizeStatus);
        }
      });
    },
    /*
      @Descripción: Arma el array de grupos para mostrar en el select
    */
    armarArrayGrupos(self, grupos){
      self.grupos = [];
      self.gruposAux = [];
      $.each(grupos, function(index, grupo){
        let grupoObj = {
          id: grupo.id,
          text: grupo.nombre,
          tipo: grupo.tipo,
          integrantes: grupo.cantidadChicos,
          genero: grupo.genero,
          etapaId: '',
          etapaNombre: ''
        };
        //Se busca la etapa actual del grupo
        $.each(grupo.Etapas, function(j, etapa){
          let fechaFin = etapa.GrupoEtapa.fechaFin;
          //La etapa actual es aquella que tenga fecha fin null
          if(fechaFin === null){
            grupoObj.etapaId = etapa.id;
            grupoObj.etapaNombre = etapa.nombre;
          }
        });
        //Solo se añaden los grupos que pertenezcan actualmente a una etapa
        if(grupoObj.etapaId !== ''){
          self.grupos.push(grupoObj);
          self.gruposAux.push(grupoObj);
        }
      });
    },
    /*
      @Descripción: Una vez seleccionado un grupo, obtiene tods su información de la base
    */
    obtenerGrupoSeleccionado(self, idGrupo){
      let urlApi = '/api/grupos/' + idGrupo;
      $.ajax({
        type: 'GET',
        url: urlApi,
        success(res){
          self.armarObjGrupoSel(self, res);
          self.armarArrayChicos(self, res);
        }
      });
    },
    armarObjGrupoSel(self, res){
      self.grupoSel = {
        nombre: res.grupo.nombre,
        id: res.grupo.id,
        tipo: res.grupo.tipo,
        cantidadChicos: res.procarianos.length
      };
    },
    armarArrayChicos(self, res){
      self.chicos = [];
      $.each(res.procarianos, function(index, procariano){
        let chicoObj = {
          nombre: procariano.Persona.nombres + ' ' + procariano.Persona.apellidos,
          id: procariano.idProcariano
        };
        self.chicos.push(chicoObj);
      });
    },
    subirAsistencias(){
      var self = this;
      var idRadioAsistencia = "";
      var idRadioFalta = "";
      var idRadioFJ = "";
			var flag = true;
      $.each(self.chicos, function(index, chico){
        //console.log('Revisando al chico: ' + chico.nombre + ' con id: ' + chico.id);
        idRadioAsistencia = '#asist-' + chico.id;
        idRadioFalta = '#falta-' + chico.id;
        idRadioFJ = '#fj-' + chico.id;
        //revisar asistencia
        if ($(idRadioAsistencia).is(':checked')) {
          self.asistencias.push(chico);
        }else if($(idRadioFalta).is(':checked')){
          self.faltas.push(chico);
        }else if($(idRadioFJ).is(':checked')){
          self.justificadas.push(chico);
        }else{
					//Si existe por lo menos un chico al cual no le he marcado su asistencia,
					self.asistencias = [];
					self.faltas = [];
					self.justificadas = [];
					$('#modalError').modal('open');
					flag = false;
					return false
				}
      });
      //CODIGO PARA ENVIAR LOS DATOS A LA BASE DE DATOS
			//Abre el modal de confirmación en caso de éxito
			if(flag){
				$('#modalConfirmacion').modal('open');
			}
			//Luego de subir las asistencias, se debe actualizar la parte del grupo
    }

	},
	computed: {
		totalChicos(){
			var self = this;
			return self.chicos.length;
		},
		totalAsistieron(){
			var self = this;
			return self.asistencias.length;
		},
		totalFaltas(){
			var self = this;
			return self.faltas.length;
		},
		totalJustificados(){
			return this.justificadas.length;
		}
	}
});
//2 way data binding de la fecha-asistencia

