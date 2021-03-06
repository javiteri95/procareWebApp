/*
	@Descripción: Controlador de la vista de verProcaeriano.ejs
	@Autor: @edisonmora95
	@FechaCreación: 31/04/2017
*/
'use strict';
var main = new Vue({
	el: '#main',
	mounted: function(){
		$('.modal').modal();
		$(".button-collapse").sideNav();
	},
	data: {
		checkboxesAux: [
			{
				value: 'Nombre',
				id: 'check-nombre'
			},
			{
				value: 'Apellido',
				id: 'check-apellido'
			},
			{
				value: 'Cédula',
				id: 'check-cedula'
			},
			{
				value: 'Dirección',
				id: 'check-direccion'
			},
			{
				value: 'Fecha de nacimiento',
				id: 'check-fecha-nacimiento'
			},
			{
				value: 'Género',
				id: 'check-genero'
			},
			{
				value: 'Email',
				id: 'check-email'
			},
			{
				value: 'Convencional',
				id: 'check-convencional'
			},
			{
				value: 'Celular',
				id: 'check-celular'
			},
			{
				value: 'Trabajo',
				id: 'check-trabajo'
			},
			{
				value: 'Colegio',
				id: 'check-colegio'
			},
			{
				value: 'Universidad',
				id: 'check-universidad'
			},
			{
				value: 'Tipo',
				id: 'check-tipo'
			},
			{
				value: 'Año',
				id: 'check-anio'
			},
			{
				value: 'Fecha de ordenación',
				id: 'check-fecha-ordenacion'
			},
			{
				value: 'Estado',
				id: 'estado'
			},
			{
				value: 'Grupo',
				id: 'grupo'
			}
		],		//Campos que el usuario puede seleccionar para realizar la búsqueda
		checkboxes: ['Nombre', 'Apellido'],		//Campo por default que se encuentra en la búsqueda
		procariano: {
			nombres: '',
			apellidos: '',
			cedula: '',
			direccion: '',
			fechaNacimiento: '',
			genero: '',
			email: '',
			convencional: '',
			celular: '',
			trabajo: '',
			colegio: '',
			universidad: '',
			tipo: '',
			anio: '',
			fechaOrdenacion: '',
			estado: '',
			grupo: ''
		},												//Objeto que va a almacenar al procariano a buscar
		procarianos: [],					//Array en el que se almacenarán los resultados de la búsqueda
		usuario: 'personal'
	},
	methods: {
		/*
			@Descripción: Función utilizada para mostrar los campos de búsqueda según los campos que se encuentran en el array checkboxes
			@Autor: @edisonmora95
			@FechaCreacion: 20-05-2017
			@ÚltimaModificación
				19/09/2017	@edisonmora95		Acomodada para que lea el nuevo formato de respuesta de la api.
		*/
		checkArray: function(nombre){
			var self = this;
			var variableEnCheckboxes = false;
			$.each(self.checkboxes, function(index, element){
				if( element === nombre ){
					variableEnCheckboxes = true;
				}
			});
			return variableEnCheckboxes;
		},
		buscar: function(){
			var self = this;
			self.procarianos = [];		//Primero se vacía el array de resultados
			var urlApi = '/api/procarianos/';
			$.ajax({
				type: 'GET',
				url: urlApi,
				headers: {
	        "x-access-token" : localStorage.getItem('token')
		    },
				data: self.procariano,
				success: function(res){
					$.each(res.datos, function(index, procarianoEncontrado){
						self.procarianos.push(procarianoEncontrado);
					});
				},
				error: function(jqXHR, exception){
					console.log(jqXHR);
					$('#modalErrorBusqueda').modal('open');
				}
			});
		},
		//Funciones para editar la forma en la que se muestra la fecha
		moment: function (date) {
      return moment(date);
    },
    date: function (date) {
      const es = moment().locale('es');
      if (date === undefined || date === '') {
        return '----';
      }
      return moment(date).format('DD MMMM YYYY');
    }
	}
});