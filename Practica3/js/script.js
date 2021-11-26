/* Añade un icono para borrar cada pregunta de los cuestionarios */
'use strict';

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

    let descripcion = querySelector(cuestionario, "div.wiki"); // Rereferencia al texto descriptivo del cuestionario

    removeElement(bloquePregunta); // Borramos el bloque con la pregunta

    // Si no quedan preguntas en el cuestionario lo borramos así como su enlace y la descripción
    if(cuestionario.querySelector(".bloque") == null){
        
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

        removeElement(descripcion); // Borramos el texto descriptivo asociado
        removeElement(cuestionario); // Elmininamos el cuestionario
        

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
function addWikipedia(terminoBuscar, nodoFormulario){

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

        let pageId = Object.values(responseAsObject.query.pages)[0].pageid;

        let textoSinProcesar = responseAsObject.query.pages[pageId].extract;

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

}

/* Función que añade una imagen de flickr a un cuestionario */
function addFlickr(terminoBuscar, nodoImagenCuestionario){

    

}

/* Función que añade preguntas a un cuestionario */
function addPregunta(event){

    // Comprobamos que ninguno de los campos del formulario haya quedado sin rellenar
    let formulario = queryAncestorSelector(event.target, "div.formulario");

    let enunciado = formulario.querySelector("input[type='text']");
    let respuestaVerdadero = formulario.querySelector("input[value='verdadero']");
    let respuestaFalso = formulario.querySelector("input[value='falso']");

    // Si el campo enunciado está vacío
    if (enunciado.value.length == 0){ 
        window.alert("Error al añadir la pregunta: Todos los campos deben ser rellenados.");
    }
    else {
        
        // Generamos el HTML correspondiente a una bloque de pregunta
        let nuevoBloque = document.createElement("div");
        nuevoBloque.className = "bloque";

        let pregunta = document.createElement("div");
        pregunta.className = "pregunta";
        pregunta.innerHTML = enunciado.value;
        insertAsLastChild(nuevoBloque, pregunta);

        let respuesta = document.createElement("div");
        respuesta.className = "respuesta";
        
        if(respuestaVerdadero.checked){
            respuesta.setAttribute("data-valor", "true");
        }
        else{
            respuesta.setAttribute("data-valor", "false");
        }

        insertAsLastChild(nuevoBloque, respuesta);

        addCruz(nuevoBloque); // Añadimos el icono de borrado
        
        let cuestionario = queryAncestorSelector(event.target, "section"); // Nos guardamos una referencia al cuestionario actual
        insertAsLastChild(cuestionario, nuevoBloque); // Añadimos la nueva pregunta a dicho cuestionario

    }

    // Reiniciamos los campos del formulario
    enunciado.value = null;
    respuestaVerdadero.checked = true;
    respuestaFalso.checked = false;

}

/* Función que añade un nuevo cuestionario */ 
function addCuestionario(event) {

    let formulario = queryAncestorSelector(event.target, "div#nuevoCuestionario"); // Nos guaradamos una referencia al div que contiene el formulario

    // Validamos que ninguno de los campos del formulario haya quedado sin rellenar
    let tema = formulario.querySelector("input[name='tema']");
    let url = formulario.querySelector("input[name='imagen']");

    if(tema.value.length == 0 || url.value.length == 0) {
        window.alert("Error al añadir el cuestionario: Todos los campos deben ser rellenados.");
    }
    else {

        let cuestionario = document.createElement("section");

        // Creamos y añadimos el título al cuestionario
        let titulo = document.createElement("h2");
        let imagen = document.createElement("img");
        imagen.src = url.value;
        imagen.alt = "Una imagen representativa de " + tema.value;
        insertAsLastChild(titulo, imagen);
        let nodoTexto = document.createTextNode("Cuestionario sobre " + tema.value);
        insertAsLastChild(titulo, nodoTexto);
        insertAsLastChild(cuestionario, titulo);
        
        // Le añadimos el id
        cuestionario.id = tema.value;

        // Creamos una nueva entrada en el índice
        let elementoLista = document.createElement("li");
        let enlace = document.createElement("a");
        enlace.href = "#" + cuestionario.id;
        enlace.textContent = tema.value;
        insertAsLastChild(elementoLista, enlace);

        // Obtenemos una referencia a la lista no ordenada del elemento nav
        let listaUl = document.querySelector("header nav ul");
        insertAsLastChild(listaUl, elementoLista);
        
        // Añadimos el cuestionario como último hijo del main
        let bloqueMain = document.querySelector("main");
        insertAsLastChild(bloqueMain, cuestionario);

        let nodoFormulario = addFormPregunta(cuestionario); // Añadimos el formulario de adición de preguntas al cuestionario

        addWikipedia(cuestionario.id, nodoFormulario); // Añadimos la descripción de wikipedia al cuestionario

        // Reseteamos los campos del formulario de adición de cuestionarios
        tema.value = null;
        url.value = null;

    }

}

function init() {

    let preguntas = document.querySelectorAll(".bloque"); // Nos guardamos todos las preguntas

    // Añadimos la cruz a cada una de las preguntas de los cuestionarios
    for(let i = 0; i < preguntas.length; i++) {
        addCruz(preguntas[i]);
    }

    let cuestionarios = document.querySelectorAll("section"); // Nos guardamos todos los cuestionarios
    
    // Añadimos el formulario de adición de preguntas a todos los cuestionarios
    for(let i = 0; i < cuestionarios.length; i++){
        let nodoFormulario = addFormPregunta(cuestionarios[i]);
        addWikipedia(cuestionarios[i].id, nodoFormulario);
    } 

    // Nos guardamos las referencias de cada campo del formulario de creación de cuestionarios
    let tema = document.querySelector("#nuevoCuestionario input[name='tema']");
    let url = document.querySelector("#nuevoCuestionario input[name='imagen']");
    let botonNuevoFormulario = document.querySelector("#nuevoCuestionario input[value='Crear nuevo cuestionario']");

    // Manejador de evento para cuando se pulsa la tecla Enter sobre el cuadro de texto de Tema del cuestionario
    tema.addEventListener("keydown", function(KeyboardEvent){
        if(KeyboardEvent.key === 'Enter'){
            addCuestionario(KeyboardEvent);
        }
    });

    // Manejador de evento para cuando se pulsa la tecla Enter sobre el cuadro de texto de URL de la imagen
    url.addEventListener("keydown", function(KeyboardEvent){
        if(KeyboardEvent.key === 'Enter'){
            addCuestionario(KeyboardEvent);
        }
    });

    // Manejador de evento para cuando se haga click en el botón de creación de nuevo cuestionario
    botonNuevoFormulario.addEventListener("click", addCuestionario,false);

}   

window.addEventListener('DOMContentLoaded', init);