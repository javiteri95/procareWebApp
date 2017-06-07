var bcrypt = require('bcryptjs');


/*
EXPORTACIONES
*/
module.exports.generarHash = function(req,res, next){

	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(hacerId(), salt, function(err, hash) {
	    	console.log(hash);
	    	req.body.contrasenna = hash;
	    	next();

	    });
	});
};

/*
FUNCIONES
*/

function hacerId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    console.log(text);
    return text;
}

module.exports.generarJsonProcariano = function(procariano){
	var respuesta = {};
	respuesta['persona'] = {};
	respuesta['procariano'] = {};
	for (var clave in procariano) {
		if (procariano.hasOwnProperty(clave)) {
    		if ( (clave == 'cedula') || (clave == 'nombres') || (clave == 'apellidos') || (clave == 'direccion')  || (clave == 'genero') || (clave == 'email') || (clave == 'celular') || (clave == 'trabajo')  || (clave == 'convencional') || (clave == 'fechaNacimiento')) {

    			respuesta['persona'][clave] = {
    				$like : '%' + procariano[clave] + '%'
    			}
    		}
    		if ( (clave == 'colegio') || (clave == 'universidad') || (clave == 'parroquia') || (clave == 'fechaOrdenacion')  || (clave == 'estado') || (clave == 'haceParticipacionEstudiantil') ) {
    			respuesta['procariano'][clave] = {
    				$like : '%' + procariano[clave] + '%'
    			}
    		}

  		}
	}
	return respuesta;
}







