//usamos el onload para que primero se carguen los elementos html de la pagina y la funcion inicializar para capturar los valores de los elementos cargados previamente
window.onload = inicializar;
//declaramos estas variables como globales xq se van a usar mas de una funcion
var formProd;
var refProd;
var tablaProd;
//declaramos las constantes en mayuscula CREATE Y UPDATE
var CREATE = "Añadir Pesaje"
var UPDATE = "Modificar Pesaje";
//declaramos la variable modo que usaremos en el switch para crear y actualizar
var modo = CREATE;
//ponemos esta referencia como global para reutilizarlla en enviarPesajeAFirebase() y traer el elemento del array snap que se va actualizar
var refPesajeAEditar;
function inicializar(){
	formProd = document.getElementById("form-reg-productos");
	formProd.addEventListener("submit", enviarProductosAFirebase, false);

	tablaProd = document.getElementById("tabla-show-productos");
	//referencia al nodo raiz de la bd firebase y a un hijo	
	refProd = firebase.database().ref().child("aries-5d088");

	mostrarProductosFirebase();

}

function mostrarProductosFirebase(){
	//on un cambio sobre value me haga algo en la funcion anonima que me devuelve 
	//el valor dela referncia bd-pesaje en snap
	//bd-pesaje es un array que vamos a leer
	//no leemos toda la bd sino solo refPesaje que refiere a bd-pesaje		
	//on("value" cada vez que se modifique se ejecuta toda la funcion
	refProd.on("value", function(snap){
		//snap.val contiene los valores de firebase que existen dentro de la referencia delnodo  bd-pesaje 
		var datos = snap.val();
		var filasAMostrar = "";
		for(var key in datos){
			filasAMostrar += 	"<tr>"+
									"<td>"+ datos[key].codigo +"</td>"+
									"<td>"+ datos[key].descripcion +"</td>"+
									"<td>"+ datos[key].categoria +"</td>"+
									"<td>"+ datos[key].precio +"</td>"+
									'<td>'+
									'<button class="btn btn-default editar" data-pesaje="'+ key + '">' +
									'<span class="glyphicon glyphicon-pencil"></span>' +
									'</button>' +
									'</td>'+
									'<td>' +
									'<button class="btn btn-danger borrar" data-pesaje="'+ key + '">' +
									'<span class="glyphicon glyphicon-trash"></span>' +
									'</button>' +
									'</td>' +
								"</tr>";
		}
		//class="btn btn-danger borrar=clase borrar , muchos botoners de la misma clase borrar
		//se agrega data-pesaje="' para saber a que key de bd-pesaje corresponde 
		//mostramos las filas en la tabla
		tablaProd.innerHTML = filasAMostrar;
		if (filasAMostrar != "") {
			//capturamos la clase editar para modificar la referencia de la fila en bd firebase
			var elementosEditables = document.getElementsByClassName("editar");
			for(var i=0; i<elementosEditables.length; i++){
				elementosEditables[i].addEventListener("click", editarPesajeFirebase, false);
			}
			//capturamos la clase borrar para eliminar la referencia de la fila en bd firebase
			var elementosBorrables = document.getElementsByClassName("borrar");
			for(var i=0; i<elementosBorrables.length; i++){
				elementosBorrables[i].addEventListener("click", borrarPesajeFirebase, false);
			}
		}
	});
}

function editarPesajeFirebase(){
	//capturo el valor del atributo key que guarde en data-pesaje y lo asigno a la variable keyDePesajeABorrar
	var keyDePesajeAEditar = this.getAttribute("data-pesaje");
	//busco la referencia en firebase del key a editar
	//se pone var refPesajeAEditar como variable global para coger la referencia del firebase y modificar en el formulario
	refPesajeAEditar = refProd.child(keyDePesajeAEditar);
	//once("value" solo se lee el valor una sola vez, snap trae el valor leido de firebase
	refPesajeAEditar.once("value", function(snap){
		//traigo los dtos del array snap de firebase y los guardo en una variable datos
		var datos = snap.val();
		//("nombre") es el id del formulario y datos.nombre es el identificador de la bd firebase
		//pinto los datos en los inputs del formulario
		document.getElementById("codigo").value = datos.codigo;
		document.getElementById("descripcion").value = datos.descripcion;
		document.getElementById("categoria").value = datos.categoria;		
		document.getElementById("precio").value = datos.precio;
	});
	//ACTUALIZA EL BOTON DE CREAR A MODIFICAR cuando pulso en editar
	document.getElementById("boton-enviar-producto").value = UPDATE;
	//asigno el valor UPDATE al modo para que entre en el switch y se actualicen los datos en la funcion enviarPesajeAFirebase
	modo = UPDATE;
	
}

function borrarPesajeFirebase(){
	//capturo el valor del atributo key que guarde en data-pesaje y lo asigno a la variable keyDePesajeABorrar
	var keyDePesajeABorrar = this.getAttribute("data-pesaje");
	//busco la referencia en firebase del key a borrar
	var refPesajeABorrar = refProd.child(keyDePesajeABorrar);
	//refPesajeABorrar tiene el valor de la referencia en firebase y con remove la borra
	refPesajeABorrar.remove();
}

function enviarProductosAFirebase(event){
	//evita que se vuelva a cargar la pagina
	event.preventDefault();

	switch(modo){
		case CREATE:
		//registra en la referencia de la bd firebase
		refProd.push({
		codigo: event.target.codigo.value,
		descripcion: event.target.descripcion.value,
		categoria: event.target.categoria.value,
		precio: event.target.precio.value
		});	
		break;
		case UPDATE:
		//ponemos la referencia al objeto en la bd firebase que vamos a modificar 
		refPesajeAEditar.update({
		codigo: event.target.codigo.value,
		descripcion: event.target.descripcion.value,
		categoria: event.target.categoria.value,
		precio: event.target.precio.value
		});
		modo = CREATE;
		document.getElementById("boton-enviar-producto").value = CREATE;
		break;
	}
//	refPesaje.push({
//		nombre: event.target.nombre.value,
//		peso: event.target.peso.value
//	});

	//borra los datos del formulario
	formProd.reset();

}