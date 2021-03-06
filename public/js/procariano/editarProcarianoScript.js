'use strict';

import VueTheMask from 'vue-the-mask';

Vue.use(VeeValidate);
Vue.use(VueTheMask);
/*
	Validaciones. Cambio de mensajes de error
*/
const dictionary = {
	en: {
		messages: {
			email(){
				return 'Ingrese un correo válido.';
			},
			required(){
				return 'Este campo es obligatorio.';
			},
			alpha_spaces(){
				return 'Este campo sólo puede contener letras y espacios.';
			},
			digits(field, length){
				return 'Este campo sólo puede contener ' + length + ' números.';
			},
			numeric(){
				return 'Este campo sólo puede contener números.';
			},
			alpha_num(){
				return 'Este campo sólo puede contener letras y números.';
			},
			regex(field, val){
				return 'No ingrese caracteres especiales.';
			}
		}
	}
};
VeeValidate.Validator.updateDictionary(dictionary);

let vm = new Vue({
	el 		 : '#editarApp',
	created(){
		const path  			= window.location.pathname;
		this.idProcariano = path.split('/')[3];
		this.obtenerProcarianoPorId(this, this.idProcariano);
	},
	mounted(){
		this.inicializarMaterialize(this);
	},
	data 	 : {
		flag    : true,
		errorObj: {
			campo: '',
			msj  : ''
		},
		grupos  : [],
		tipos   : [],
		tempGrupoPrevio: {
			id: '',
			text: ''
		},
		tempTipoPrevio: {
			id: '',
			text: ''
		},
		gruposObtenidos : [],
		gruposFormacion : [],
		gruposCaminantes: [],
		gruposPescadores: [],
		gruposMayores   : [],
		errorServidor   : '',
		dataFinishedLoading: false,
		grupoprocariano 	 : {
			id 	: '',
			text: ''
		},
		tipoprocariano 		 : {
			id 	: '',
			text: ''
		},
		procariano: {},
		mask_format: {
	    telef_convencional : "(0#)###-####",
	    telf_celular 			 : "(0#)#-###-####",
	    Ruc_Mask 					 : "##########"
    },
    errorAjax : {
    	titulo : '',
    	descripcion : ''
    }
	},
	methods: {
		//Funciones para editar la forma en la que se muestra la fecha
		moment(date) {
      return moment(date);
    },
    date(date){
      var es = moment().locale('es');
      if (date === undefined || date === '') {
        return '----';
      }
      return moment(date).format('DD MMMM YYYY');
    },
    //////////////////////////////////
		//OBTENER DATOS DE LA BASE
		//////////////////////////////////
    /*
			@Descripción: 
				Obtiene toda la información del Procariano de la base de datos
				Asigna los valores al objeto para mostrar
			@ÚltimaModificación:
    */
		obtenerProcarianoPorId(self, id){
			const urlApi = '/api/procarianos/' + id;
			$.ajax({
				type   : 'GET',
				url    : urlApi,
				headers: {
	        "x-access-token" : localStorage.getItem('token')
		    },
				success(res){
					console.log(res)
					self.asignarValoresObtenidos(self, res);
					self.obtenerTodosLosGrupos(self);
					self.obtenerTiposProcariano(self);
				}
			});
		},
		/*
			@Descripción:
				Obtiene todos los grupos existentes en la base de datos.
				Los almacena en self.gruposObtenidos
    */
    obtenerTodosLosGrupos(self){
    	$.ajax({
    		type  : 'GET',
    		url 	: '/api/grupos/',
    		headers: {
	        "x-access-token" : localStorage.getItem('token')
		    },
    		success(res){
    			if( res.estado ){
    				self.gruposObtenidos = res.datos;
    				self.initGrupos(self, self.gruposObtenidos, self.procariano.genero, self.tipoprocariano.id);
    			}else{
    				self.mostrarMensajeDeErrorAjax(self, 'Error de base de datos', res.mensaje);
    			}
    		},
    		error(err){
    			console.log(err);
    			self.mostrarMensajeDeErrorAjax(self, 'Error de conexión', 'No se pudo conectar con el servidor para obtener los grupos. Intente nuevamente.');
    		}
    	});
    },
    /*
			@Descripción:
				Obtiene todos los tipos de procarianos de la base de datos
				Los almacena dentro de self.tipos
    */
    obtenerTiposProcariano(self){
    	$.ajax({
    		type : 'GET',
    		url  : '/api/tipo/',
    		headers: {
	        "x-access-token" : localStorage.getItem('token')
		    },
    		success(res){
    			self.tiposObtenidos = res.datos;
    			self.initTipos(self, self.tiposObtenidos);
    		},
    		error(err){
    			console.log(err);
    			self.mostrarMensajeDeErrorAjax(self, 'Error de conexión', 'No se pudo conectar con el servidor. Intente nuevamente.');
    		}
    	});
    },
    cambiarGrupo(urlApi ,data){
    	$.ajax({
    		url: urlApi,
    		type: 'PUT',
    		data: data,
    		headers: {
	        "x-access-token" : localStorage.getItem('token')
		    },
    		success(res){
    			Materialize.toast('Procariano cambiado de grupo', 3000, 'rounded');
    		},
    		error(err){
    			console.log(err)
    			Materialize.toast('Error al intentar cambiar de grupo. Recargue la página.', 5000, 'rounded red');
    		}
    	});
    }, 
    //////////////////////////////////
		//FUNCIONES PARA ARMAR EL DOM
		//////////////////////////////////
		inicializarMaterialize(self){
			$('.datepicker').pickadate({
			  monthsFull 		: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
			  monthsShort 	: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
			  weekdaysFull 	: ['Domingo','Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
			  weekdaysShort : ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
			  today 				: 'Hoy',
			  clear 				: 'Limpiar',
			  close 				: 'Cerrar',
		    selectMonths 	: true, // Creates a dropdown to control month
		    selectYears 	: 100,  // Creates a dropdown of 15 years to control year,
		    closeOnSelect : true  // Close upon selecting a date,
		  });
			$(".button-collapse").sideNav();
			$('.modal').modal();
			$('select').material_select();
			/* FUNCIONES ON CHANGE SELECTS */
			$('#selectTipo').change( () => {
				const tipoId = $('#selectTipo').val();
				self.tipoprocariano.id 	 = tipoId;
				self.tipoprocariano.text = $('#selectTipo option:selected').text ();
				self.procariano.tipoId   = tipoId;
				//console.log('tipoId:', tipoId);
				self.initGrupos(self, self.gruposObtenidos, self.procariano.genero, parseInt(tipoId));
			});
			$('#selectGrupo').change( () => {
				const grupoId = parseInt($('#selectGrupo').val());
				const urlApi = '/api/procarianos/' + self.procariano.idProcariano + '/grupo/cambiar/';
				//console.log(urlApi)
				const data = {
					idGrupoNuevo  : grupoId,
					idGrupoPrev : self.grupoprocariano.id
				};
				//console.log(data)
				self.grupoprocariano.id 	= grupoId;
				self.grupoprocariano.text = $('#selectGrupo option:selected').text();
				self.cambiarGrupo(urlApi, data);
			});
		},
		mostrarErrorValidacion(campo, msj){
    	vm.errorObj.campo = campo;
      vm.errorObj.msj 	= msj;
      $('#modalErrorForm').modal('open');
    },
		/*
			@Descripción:
				De los datos obtenidos de la base, se asignan todos los valores al objeto self.procariano
		*/
		asignarValoresObtenidos(self, res){
			self.procariano 							= res.datos.procariano;
			self.procariano.idProcariano 	= self.procariano.id;
			Object.assign(self.procariano, self.procariano.Persona);
      delete self.procariano.Persona;
      delete self.procariano.id;

      self.tipoprocariano.id 		= res.datos.tipoActual.id;
			self.tipoprocariano.text 	= res.datos.tipoActual.nombre;

			self.grupoprocariano.id 	= res.datos.grupoActual.id;
			self.grupoprocariano.text = res.datos.grupoActual.nombre;

			self.fechaNacimiento 			= new Date(self.procariano.fechaNacimiento.replace(/-/g, '\/').replace(/T.+/, ''));
			self.dataFinishedLoading 	= true;
			console.log(vm.procariano.fechaNacimiento)
			//Asignar fecha de nacimiento
			const $input = $('#fechaNacimiento').pickadate();

			// Use the picker object directly.
			const picker = $input.pickadate('picker');
			picker.set('select', vm.fechaNacimiento);
		},
		/*
			@Descripción: 
				Divide los grupos obtenidos de la base de datos en arrays de acuerdo a su tipo y género
				Arma el select de grupos
			@Params:
				grupos -> grupos obtenidos de la base de datos al hacer la llamada a la api.
				generoText -> genero del Procariano
				tipoId -> id del tipo del Procariano
    */
    initGrupos(self, grupos, generoText, tipoId){
    	/* Filtro los grupos por género */
			const genero = ( generoText === 'masculino' ) ? 'Procare' : 'Procare Mujeres';
			let gruposFiltradosPorGenero = $.grep(grupos, (grupo, index) => {
				return grupo.genero === genero;
			});
			//console.log('Grupos por genero:', gruposFiltradosPorGenero)
			/* Filtro los grupos por tipo */
			let tipo  = ( tipoId === 1 ) ? 'Formación' : ( tipoId === 2 ) ? 'Caminantes' : ( tipoId === 3 || tipoId === 4 ) ? 'Pescadores' : ( tipoId === 6 ) ? 'Mayores' : null;
			//console.log('tipo: ', tipo)
			let gruposFiltradosPorTipo   = $.grep(gruposFiltradosPorGenero, (grupo, index) => {
				return grupo.tipo === tipo;
			});
			//console.log('Grupos en select: ', gruposFiltradosPorTipo)
			/* Armo el select */
			self.armarSelect(self, gruposFiltradosPorTipo, '#selectGrupo');
			/* Selecciono el grupo del Procariano actual */	
			$('#selectGrupo').val(self.grupoprocariano.id);
			$('#selectGrupo').material_select();
    },
    initTipos(self, tipos){
    	self.armarSelect(self, tipos, '#selectTipo');
			/* Selecciono el tipo del Procariano actual */	
			$('#selectTipo').val(self.tipoprocariano.id);
			$('#selectTipo').material_select();
    },
    /*
			@Descripción:
				Se ejecuta cuando el usuario selecciona un género del procariano
				Filtra todos los grupos a mostrar dependiendo del género seleccionado
    */
    filtrarGruposPorGenero(self, generoSeleccionado){
    	let aux = [];
    	let generoGrupoSeleccionado = '';		//Género del grupo a mostrar
    	if( generoSeleccionado !== '' ){
    		//Indica el genero del grupo a mostrar
    		if( generoSeleccionado == 'masculino' ){
    			generoGrupoSeleccionado = 'Procare';
    		}else{
    			generoGrupoSeleccionado = 'Procare Mujeres';
    		}
    		//De los grupos obtenidos, se muestran solo los grupos con el género seleccionado
    		aux = $.grep(self.gruposObtenidos, (grupo, index) => {
    			return grupo.genero === generoGrupoSeleccionado;
    		});
    	}
    	return aux;
    },
    /*
			@Descripción:
				Arma un select con los datos de un array
			@Params:
				array -> datos obtenidos de la base de datos
				idselect -> id del elemento con #
    */
    armarSelect(self, array, idSelect){
    	$(idSelect).empty();
    	$(idSelect).append('<option value=""  disabled selected></option>');
    	$.each(array, (index, elemento) => {
    		$(idSelect).append('<option value=' + elemento.id + '>' + elemento.nombre + '</option>');
    	});
    	$('select').material_select();
    },
    mostrarMensajeDeErrorAjax(self, titulo, descripcion){
    	self.errorAjax.titulo 			= titulo;
			self.errorAjax.descripcion	= descripcion;
			$('#modalErrorAjax').modal('open');
    },
		aceptarEdicion(){
			const anioIngresado = $('#fechaNacimiento').pickadate('picker').get('highlight', 'yyyy');
			this.$validator.validateAll()
			.then( result => {
				console.log(result)
				if( result ){
					//Si pasa las validaciones entonces valida la fecha de nacimiento
					if ( vm.validarFechaNacimiento( anioIngresado ) ) {
						console.log('procariano:', vm.procariano);
						vm.enviarEdicion();
					} else {
						$('#modalErrorForm').modal('open');
					}
				} else {
					console.log(vm.errors);
					vm.mostrarErrorValidacion(vm, vm.errors.items[0].field, vm.errors.items[0].msg);
				}
				
			})
			.catch( error => {
				console.log('error:', error)
			})
		},
		/*
			@Descripción: Valida que la fecha de nacimiento ingresada no sea de alguien menor a 11 años.
				Solo valida eso ya que Vee Validate valida que la fecha haya sido ingresada
			@Return:
				True si es una fecha válida (>11)
				False si es inválida
    */
    validarFechaNacimiento(year){
			let actualYear 	= new Date().getFullYear();
			let diferencia 	= actualYear - year;
			if( diferencia < 11 ){
				vm.errorObj.campo = 'Fecha de nacimiento';
				vm.errorObj.msj 	= 'No puede ingresar a alguien con menos de 11 años.';
				return false;
			}
			return true;
    },
    enviarEdicion(){
    	$.ajax({
    		type    : 'PUT',
    		url     : '/api/procarianos/' + vm.procariano.PersonaId,
    		data    : vm.procariano,
    		headers : {
	        "x-access-token" : localStorage.getItem('token')
		    },
		    success : function(res){
		    	console.log(res)
		    	$('#modalEdicionExitosa').modal('open');
		    },
		    error   : function(err){
		    	console.log(err);
		    	vm.mostrarMensajeDeErrorAjax(vm, 'Error', err.responseJSON.mensaje);
		    }
    	});
    }
	}

});

