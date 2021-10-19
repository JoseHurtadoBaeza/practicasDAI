/* Añade un icono para borrar cada pregunta de los cuestionarios */
function addCruz(nodo) {

    let cruz = document.createElement("div");
    cruz.className = "borra";
    cruz.innerHTML = "&#9746";
    insertAsFirstChild(nodo, cruz);
    nodo.addEventListener("click", borraPregunta, false); // TODO: Comprobar que si hay que poner false o true

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

    let pregunta = queryAncestorSelector(event.target, ".bloque"); // Referencia a la pregunta
    
    let cuestionario = queryAncestorSelector(pregunta, "section"); // Referencia al cuestionario

    let enlace = queryAncestorSelector(pregunta , "header nav a#" + cuestionario.getAttribute("id")); // Referencia al enlace que dirige al cuestionario

    removeElement(pregunta); // Borramos la pregunta

    // Si no quedan preguntas en el cuestionario lo borramos así como su enlace
    if(cuestionario.querySelector(".bloque") == null){
        
        removeElement(cuestionario);
        removeElement(enlace);

    }

}  