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

/* Inserta  el nodo nuevoHijo como hijo del nodo padre inmediatamente antes del nodo hijo */
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

    removeElement(bloquePregunta); // Borramos el bloque con la pregunta

    // Si no quedan preguntas en el cuestionario lo borramos así como su enlace
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

        removeElement(cuestionario); // Elmininamos el cuestionario
        

    }

} 

function addFormPregunta(nodoSection) {

    // Nos guardamos el prefijo a añadir en los name
    let prefijo = nodoSection.id + "_";

    // Creamos el div que va a representar el formulario de inserción de preguntas
    let form = document.createElement("div");
    form.className = "formulario";

    // Creamos la lista desordenada y sus 3 elementos
    let lista = document.createElement("ul");
    let enunciado = document.createElement("li");
    let respuesta = document.createElement("li");
    let nuevaPregunta = document.createElement("li");

    // Preparamos el elemento enunciado
    let labelEnunciado = document.createElement("label");
    labelEnunciado.textContent = "Enunciado de la pregunta:";
    let inputEnunciado = document.createElement("input");
    inputEnunciado.type = "text";
    inputEnunciado.name = prefijo + "respuesta";

    // Preparamos el elemento respuesta
    let labelRespuesta = document.createElement("label");
    labelRespuesta.textContent = "Respuesta:";
    let input1Respuesta = document.createElement("")

    addEventListener(boton, addPregunta, false); // Manejador evento de clic sobre el botón

}

function init() {

    let preguntas = document.querySelectorAll(".bloque"); // Nos guardamos todos las preguntas

    // Añadimos la cruz a cada una de las preguntas de los cuestionarios
    for(let i = 0; i < preguntas.length; i++) {
        addCruz(preguntas[i]);
    }

}   

window.addEventListener('DOMContentLoaded', init);