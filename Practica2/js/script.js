function addCruz(nodo) {
    let div = document.createElement("div");
    div.className="borra";
    insertAsFirstChild(div, nodo);
}

// FUNCIONES AUXILIARES
function insertAsLastChild(padre, nuevoHijo){

}

function insertAsFirstChild(padre, nuevoHijo){



}

function insertBeforeChild(padre, hijo, nuevoHijo){



}

function removeElement(nodo){



}

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