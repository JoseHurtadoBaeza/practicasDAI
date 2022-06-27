/* Añade un icono para borrar cada pregunta de los cuestionarios */
'use strict';

// Endpoint de la API de los cuestionarios:
const base="/cuestionarios/v1";

const cabeceras= {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

function print(r) {
  const e= document.querySelector('#mensaje');  
  if(r.result) {
    e.textContent= JSON.stringify(r.result);
  }
  else {
    e.textContent= JSON.stringify(r.error);
  }
}

function printError(s) {
  const e= document.querySelector('#mensaje');  
  e.textContent= `Problema de conexión: ${s}`;
}

function addCruz(nodo) {

    let cruz = document.createElement("div");
    cruz.className = "borra";
    cruz.innerHTML = "&#9746";
    insertAsFirstChild(nodo, cruz);
    cruz.addEventListener("click", borraPregunta, false);

}

// FUNCIONES AUXILIARES

/* Inserta el nodo nuevoHijo como último hijo del nodo padre */
function insertAsLastChild(padre, nuevoHijo){

    padre.append(nuevoHijo);

}

/* Inserta el nodo nuevoHIjo como primer hijo del nodo padre */
function insertAsFirstChild(padre, nuevoHijo){

    padre.prepend(nuevoHijo);

}

/* Inserta el nodo nuevoHijo como hijo del nodo padre inmediatamente antes del nodo hijo */
function insertBeforeChild(padre, hijo, nuevoHijo){

    padre.insertBefore(nuevoHijo, hijo);

}

/* Elimina del DOM el nodo pasado como parámetro */
function removeElement(nodo){

    nodo.remove();

}

/* Accede a un ancestro para el que conocemos un selector, pero no conocemos
la distancia exacta a la que se encuentra o no nos interesa que nuestro código 
dependa en exceso de dicha distancia */
function queryAncestorSelector(node, selector){

    var parent= node.parentNode;
    var all = document.querySelectorAll(selector);
    var found= false;
    while (parent !== document && !found) {
        for (var i = 0; i < all.length && !found; i++) {
            found= (all[i] === parent)?true:false;
        }
        parent= (!found)?parent.parentNode:parent;
    }
    return (found)?parent:null;

}

/* Función que nos permite borrar preguntas de los cuestionarios */
function borraPregunta(event) {

    let bloquePregunta = queryAncestorSelector(event.target, ".bloque"); // Referencia a la pregunta

    let cuestionario = queryAncestorSelector(bloquePregunta, "section"); // Referencia al cuestionario

    let preguntaId = bloquePregunta.getAttribute("data-identificadorbd"); 

    event.preventDefault();
    const url= `${base}/pregunta/${preguntaId}`;
    const payload= {}; 
    var request = {
        method: 'DELETE', 
        headers: cabeceras,
        body: JSON.stringify(payload),
    };
    fetch(url,request)
    .then( response => response.json() )
    .then( r => {

        if (r.error != null){
            throw new Error("Error al borrar la pregunta con id " + preguntaId + ":" + r.error);
        }

        removeElement(bloquePregunta); // Borramos el bloque con la pregunta

    })
    .catch( error => window.alert(error) );

    // Si no quedan preguntas en el cuestionario lo borramos así como su enlace y la descripción
    if(cuestionario.querySelector(".bloque") == null){
        
        let eliminado = false;
        let cuestionarioId = cuestionario.getAttribute("data-identificadorbd");

        event.preventDefault(); // Evitamos la recarga de la página
        const url= `${base}/${cuestionarioId}`;
        const payload= {};
        var request = {
            method: 'DELETE', 
            headers: cabeceras,
            body: JSON.stringify(payload),
        };
        fetch(url,request)
        /*.then( response => {
            if (!response.ok){
                throw new Error("No se ha podido establecer la conexión con el servidor")
            }
            response.json() 
        })*/
        .then( response => response.json())
        .then( r  => {
            if (r.error != null) {
                throw new Error("Error al borrar el cuestionario cuyo tema es " + cuestionarioId + ":" + r.error);
            }
            eliminado = true;
        })
        .catch( (error) => window.alert(error) );

        // Si el cuestionario se ha borrado correctamente en la BD
        if (eliminado){

            // Nos guardamos todos los enlaces actuales
            let links = document.querySelectorAll("header nav ul a");

            // Nos guardamos el selector para la comparación
            let href = "#" + cuestionario.getAttribute("id");

            let encontrado = false;

            // Buscamos el enlace que case con el href
            for (let i = 0; i < links.length && !encontrado; i++){

                if(links[i].getAttribute("href") == href){

                    removeElement(queryAncestorSelector(links[i], "li")); // Borramos el elemento li de la lista que contiene el enlace
                    encontrado = true;

                }

            }

            removeElement(cuestionario); // Elmininamos el cuestionario

        }

    }

} 

/* Función que añade un formulario para añadir preguntas a un cuestionario */
function addFormPregunta(nodoSection) {

    // Nos guardamos el prefijo a añadir en los name
    let prefijo = nodoSection.id + "_";

    // Creamos el div que va a representar el formulario de inserción de preguntas
    let formulario = document.createElement("div");
    formulario.className = "formulario";

    // Creamos la lista desordenada y sus 3 elementos
    let lista = document.createElement("ul");
    insertAsLastChild(formulario, lista);
    let enunciado = document.createElement("li");
    insertAsLastChild(lista, enunciado);
    let respuesta = document.createElement("li");
    insertAsLastChild(lista, respuesta);
    let nuevaPregunta = document.createElement("li");
    insertAsLastChild(lista, nuevaPregunta);

    // Preparamos el elemento enunciado
    let labelEnunciado = document.createElement("label");
    labelEnunciado.textContent = "Enunciado de la pregunta:";
    insertAsLastChild(enunciado, labelEnunciado);
    let inputEnunciado = document.createElement("input");
    inputEnunciado.type = "text";
    inputEnunciado.name = prefijo + "respuesta";
    insertAsLastChild(enunciado, inputEnunciado);

    // Preparamos el elemento respuesta
    let labelRespuesta = document.createElement("label");
    labelRespuesta.textContent = "Respuesta:";
    insertAsLastChild(respuesta, labelRespuesta);

    let input1Respuesta = document.createElement("input");
    input1Respuesta.type = "radio";
    input1Respuesta.name = prefijo + "respuesta";
    input1Respuesta.value = "verdadero";
    input1Respuesta.setAttribute("checked", "");
    let texto1Respuesta = document.createTextNode("Verdadero");
    insertAsLastChild(respuesta, input1Respuesta);
    insertAsLastChild(respuesta, texto1Respuesta);

    let input2Respuesta = document.createElement("input");
    input2Respuesta.type = "radio";
    input2Respuesta.name = prefijo + "respuesta";
    input2Respuesta.value = "falso";
    let texto2Respuesta = document.createTextNode("Falso");
    insertAsLastChild(respuesta, input2Respuesta);
    insertAsLastChild(respuesta, texto2Respuesta);

    // Preparamos el elemento nuevaPregunta
    let boton = document.createElement("input");
    boton.type = "button";
    boton.value = "Añadir nueva pregunta";
    insertAsLastChild(nuevaPregunta, boton);

    // Nos guardamos una referencia a la primera pregunta si la hubiera
    let bloque = nodoSection.querySelector(".bloque");

    // Añadimos el formulario generado al cuestionario antes de la primera pregunta si existiese
    if(bloque !== null) {
        insertBeforeChild(nodoSection, bloque, formulario);
    }
    else {
        insertAsLastChild(nodoSection, formulario);
    }


    // Manejador para cuando se pulsa la tecla Enter sobre el campo 
    enunciado.addEventListener("keydown", function(KeyboardEvent){
        if(KeyboardEvent.key === 'Enter'){
            addPregunta(KeyboardEvent);
        }
    });

    // Manejador para el evento de clic sobre el botón
    boton.addEventListener("click", addPregunta, false); // Manejador evento de clic sobre el botón

    return formulario;

}

/* Función que utiliza el api de wikipedia para añadir un texto descriptivo a cada cuestionario */
/*function addWikipedia(terminoBuscar, nodoFormulario){

    var descripcion = document.createElement("div");
    descripcion.className = "wiki";

    fetch('https://es.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&continue&titles=' + terminoBuscar)
    .then(function(response) { // Obtenemos la respuesta
        if(!response.ok){
            throw Error(response.statusText);
        }
        return response.json(); // Convertimos el json en un objeto javascript
    }) 
    .then(function(responseAsObject){ // Procesamos la respuesta para eliminar los [num]

        let pageID = Object.values(responseAsObject.query.pages)[0].pageid;

        let textoSinProcesar = responseAsObject.query.pages[pageID].extract;

        var regex = /\[\d+]/g;
        var replacement = "";
        let textoProcesado = textoSinProcesar.replace(regex, replacement);

        descripcion.textContent = textoProcesado;

    })
    .catch(function(error) {
        console.log('Ha habido un problema: \n', error);
    })

    let padre = queryAncestorSelector(nodoFormulario, "section");

    // Intertamos el nodo con la descripción de wikipedia antes del formulario cuyo nodo se ha pasado como parámetro
    insertBeforeChild(padre, nodoFormulario, descripcion);

}*/

/* Función que añade una imagen de flickr a un cuestionario */
/*function addFlickr(terminoBuscar, nodoImagenCuestionario){

    fetch('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=c8550842d585a2ef61a21fe29642258b&text=' + terminoBuscar + '&format=json&per_page=10&media=photos&sort=relevance&nojsoncallback=1')
    .then(function(response) {
        if(!response.ok){
            throw Error(response.statusText);
        }
        return response.json(); // Convertimos a un objeto javascript
    })
    .then(function(responseAsObject) {
        
        // Si se encuentra alguna imagen para el término buscado
        if(responseAsObject.photos.photo.length > 0){
            
            let photoId = responseAsObject.photos.photo[0].id; // Nos guardamos el id de la primera foto devuelta por flickr para el término buscado

            fetch('https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=c8550842d585a2ef61a21fe29642258b&photo_id=' + photoId + '&format=json&nojsoncallback=1')
            .then(function(response){
                if(!response.ok){
                    throw Error(response.statusText)
                }
                return response.json(); // Convertimos a un objeto javascript
            })
            .then(function(responseAsObject){
    
                let src = responseAsObject.sizes.size[0].source; // Nos guardamos la referencia a la imagen con el formato más compacto que es la primera
                nodoImagenCuestionario.src = src;
    
            })
            .catch(function(error) {
                console.log('Ha habido un problema: \n', error);
            })

        }
        else { // Sino
            nodoImagenCuestionario.src = "./img/globe_east_540.jpg";
        }

    })
    .catch(function(error) {
        console.log('Ha habido un problema: \n', error);
    })
}*/

/* Función que añade preguntas a un cuestionario */
function addPregunta(event){

    // Comprobamos que ninguno de los campos del formulario haya quedado sin rellenar
    var formulario = queryAncestorSelector(event.target, "div.formulario");

    let enunciado = formulario.querySelector("input[type='text']");
    let respuestaVerdadero = formulario.querySelector("input[value='verdadero']");
    let respuestaFalso = formulario.querySelector("input[value='falso']");

    // Si el campo enunciado está vacío
    if (enunciado.value.length == 0){ 
        window.alert("Error al añadir la pregunta: Todos los campos deben ser rellenados.");
    }
    else {

        var respuestaCorrecta;

        if (respuestaVerdadero.checked == true) {
            respuestaCorrecta = "Verdadero";
        } else if (respuestaFalso.checked == true){
            respuestaCorrecta = "Falso";
        }
        
        let section = queryAncestorSelector(formulario, "section");
        let cuestionarioId = section.getAttribute("data-identificadorbd");

        event.preventDefault(); // Prevenimos la recarga de la página
        const url= `${base}/${cuestionarioId}/pregunta`;
        const payload= {
            textoPregunta:enunciado.value,
            respuestaCorrecta:respuestaCorrecta,
        };
        const request = {
            method: 'POST', 
            headers: cabeceras,
            body: JSON.stringify(payload),
        };
        fetch(url,request)
        .then( response => response.json() )
        .then( r => {

            if (r.error != null){
                throw new Error("Error al crear la pregunta para el cuestionario con id " + cuestionarioId + ":" + r.error);
            }

            if (r.result){

                // Generamos el HTML correspondiente a una bloque de pregunta
                let nuevoBloque = document.createElement("div");
                nuevoBloque.className = "bloque";
                nuevoBloque.setAttribute("data-identificadorbd", r.result.preguntaId); // Atributo para guardar el id de la pregunta en la BD

                let pregunta = document.createElement("div");
                pregunta.className = "pregunta";
                pregunta.innerHTML = payload.textoPregunta; // Obtenemos el valor del payload, porque no podemos acceder al valor de las variables externas
                insertAsLastChild(nuevoBloque, pregunta);

                let respuesta = document.createElement("div");
                respuesta.className = "respuesta";
                
                // No podemos consultar los valores de las variables externas, así que consultamos el payload
                if(payload.respuestaCorrecta == "Verdadero"){
                    respuesta.setAttribute("data-valor", "true");
                }
                else if(payload.respuestaCorrecta == "Falso"){
                    respuesta.setAttribute("data-valor", "false");
                }

                insertAsLastChild(nuevoBloque, respuesta);

                addCruz(nuevoBloque); // Añadimos el icono de borrado
                
                let cuestionario = queryAncestorSelector(event.target, "section"); // Nos guardamos una referencia al cuestionario actual
                insertAsLastChild(cuestionario, nuevoBloque); // Añadimos la nueva pregunta a dicho cuestionario

            }

        })
        .catch( error => window.alert(error) );

    }

    // Reiniciamos los campos del formulario
    enunciado.value = null;
    respuestaVerdadero.checked = true;
    respuestaFalso.checked = false;

}

/* Función que forma el código html de los cuestionarios y lo incrusta en el main */
function insertaCuestionario(cuestionario){

    let componente = document.createElement("encabezado-cuestionario");
    componente.setAttribute("data-tema", cuestionario.id);
    insertAsLastChild(cuestionario, componente);

    // Creamos una nueva entrada en el índice
    let elementoLista = document.createElement("li");
    let enlace = document.createElement("a");
    enlace.href = "#" + cuestionario.getAttribute("data-identificadorbd");
    enlace.textContent = cuestionario.id;
    insertAsLastChild(elementoLista, enlace);

    // Obtenemos una referencia a la lista no ordenada del elemento nav
    let listaUl = document.querySelector("header nav ul");
    insertAsLastChild(listaUl, elementoLista);
    
    // Añadimos el cuestionario como último hijo del main
    let bloqueMain = document.querySelector("main");
    insertAsLastChild(bloqueMain, cuestionario);

    // Añadimos el formulario de adición de preguntas al cuestionario
    addFormPregunta(cuestionario);

}

/* Función que añade un nuevo cuestionario */ 
function addCuestionario(event) {

    let formulario = queryAncestorSelector(event.target, "div#nuevoCuestionario"); // Nos guardamos una referencia al div que contiene el formulario

    // Validamos que ninguno de los campos del formulario haya quedado sin rellenar
    let tema = formulario.querySelector("input[name='tema']");

    if(tema.value.length == 0) {
        window.alert("Error al añadir el cuestionario: Todos los campos deben ser rellenados.");
    }
    else {

        let cuestionario = document.createElement("section");

        cuestionario.id = tema.value; // Le añadimos el id

        event.preventDefault(); // Evitamos la recarga de toda la página
        const url= `${base}/creacuestionario/${cuestionario.id}`;
        const payload= {};
        const request = {
            method: 'POST', 
            headers: cabeceras,
            body: JSON.stringify(payload),
        };
        fetch(url,request)
        /*.then( response => {
            if (!response.ok){
                throw new Error("No se ha podido establecer la conexión con el servidor")
            }
            response.json() 
        })*/
        .then( response => response.json())
        .then( r => {
            if (r.error != null){
                throw new Error("Error al crear el cuestionario cuyo tema es " + cuestionario.id + ":" + r.error);
            }

            if (r.result){
                let cuestionarioId = r.result.cuestionarioId;
                cuestionario.setAttribute("data-identificadorbd", cuestionarioId); // Atributo para guardar el id del cuestionario en la BD
                insertaCuestionario(cuestionario); // Insertamos el cuestionario en el main del html
            }
        })
        .catch( (error) => window.alert(error) );

        // Reseteamos los campos del formulario de adición de cuestionarios
        tema.value = null;

    }

}


function init() {

    /*let preguntas = document.querySelectorAll(".bloque"); // Nos guardamos todos las preguntas

    // Añadimos la cruz a cada una de las preguntas de los cuestionarios
    for(let i = 0; i < preguntas.length; i++) {
        addCruz(preguntas[i]);
    }

    let cuestionarios = document.querySelectorAll("section"); // Nos guardamos todos los cuestionarios
    
    // Añadimos el formulario de adición de preguntas a todos los cuestionarios
    for(let i = 0; i < cuestionarios.length; i++){
        addFormPregunta(cuestionarios[i]);
    }*/
    
    // Utilizamos el nuevo servicio para obtener los temas de cuestionarios almacenados en la BD
    // y así poder generar los cuestionarios en el html al cargar la aplicación
    const url= `${base}/cuestionarios`;
    const request = {
        method: 'GET', 
        headers: cabeceras,
    };
    fetch(url,request)
    /*.then( response => 
        if (!response.ok){
            throw new Error("No se ha podido establecer la conexión con el servidor")
        }
        response.json())*/
    .then( response => response.json())
    .then( r => {

        if (r.error != null){
            throw new Error("Error al obtener los cuestionarios de la BD: " + r.error)
        }

        if (r.result) {
            for(var i=0;i<r.result.length;i++) {

                let cuestionario = document.createElement("section");
                cuestionario.id = r.result[i].tema; // Le añadimos el id
                cuestionario.setAttribute("data-identificadorbd", r.result[i].cuestionarioId);

                insertaCuestionario(cuestionario); // Insertamos el cuestionario en el main

            }
        }
    })
    .catch( error => window.alert(error) );


    // Nos guardamos las referencias de cada campo del formulario de creación de cuestionarios
    let tema = document.querySelector("#nuevoCuestionario input[name='tema']");
    let botonNuevoFormulario = document.querySelector("#nuevoCuestionario input[value='Crear nuevo cuestionario']");

    // Manejador de evento para cuando se pulsa la tecla Enter sobre el cuadro de texto de Tema del cuestionario
    tema.addEventListener("keydown", function(KeyboardEvent){
        if(KeyboardEvent.key === 'Enter'){
            addCuestionario(KeyboardEvent);
        }
    });

    // Manejador de evento para cuando se haga click en el botón de creación de nuevo cuestionario
    botonNuevoFormulario.addEventListener("click", addCuestionario, false);

}   

window.addEventListener('DOMContentLoaded', init);