'use strict';

(function() {
    
    const template = document.createElement('template');

    template.innerHTML = `
    <style> 

        h2{
            font-size: 25px;
            font-weight: bold;
        }

        h2 img {
            vertical-align: text-top;
            height: 50px;
            width: 50px;
            margin-right: 10px;
            border: 1px solid lightgray;
        }

        .wiki {
            font-size: 90%;
        }

    </style>

    <script>
        console.log("Template instanciado");
    </script>

    <h2></h2>
    <div class="wiki"></div>`;

    class Encabezado extends HTMLElement {

        static get observedAttributes() { return ['data-tema'] } // Indicamos los atributos que vamos a controlar su cambio

        constructor() {
            super();
            let clone = template.content.cloneNode(true);
            let shadowRoot = this.attachShadow({
                mode: 'open'
            });
            shadowRoot.appendChild(clone);
        }

        attributeChangedCallback(name, oldValue, newValue) {
            
            var componente = this; // Aquí this apunta al shadow host del componente web (clausura)
            if (name === 'data-tema'){
                this.tema = this.hasAttribute('data-tema')?newValue:oldValue;
            }

            fetch('https://es.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&continue&titles=' + componente.tema)
            .then(function(response) { // Obtenemos la respuesta
                if(!response.ok){
                    throw Error(response.statusText);
                }
                return response.json(); // Convertimos el json en un objeto javascript
            }) 
            .then(function(responseAsObject){ // Procesamos la respuesta para eliminar los [num]
        
                let pageID = Object.values(responseAsObject.query.pages)[0].pageid;

                // Comprobamos que el término buscado haya devuelto alguna descripción de la api de wikipedia
                if (pageID != null){
        
                    let textoSinProcesar = responseAsObject.query.pages[pageID].extract;
        
                    var regex = /\[\d+]/g;
                    var replacement = "";
                    let textoProcesado = textoSinProcesar.replace(regex, replacement);
            
                    componente.shadowRoot.querySelector(".wiki").textContent = textoProcesado;
                } else {
                    componente.shadowRoot.querySelector(".wiki").textContent = "";
                }

            })
            .catch(function(error) {
                console.log('Ha habido un problema: \n', error);
            });

            fetch('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=c8550842d585a2ef61a21fe29642258b&text=' + componente.tema + '&format=json&per_page=10&media=photos&sort=relevance&nojsoncallback=1')
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
                        
                        let titulo = componente.shadowRoot.querySelector("h2");
                        titulo.textContent = ""; // Borramos el contenido anterior del titulo para actual         
            
                        titulo.appendChild(textoTitulo);
            
                    })
                    .catch(function(error) {
                        console.log('Ha habido un problema: \n', error);
                    })

                }
                else { // Sino
                             
            
                    let textoTitulo = document.createTextNode("Cuestionario sobre " + componente.tema);
                    let src = "./img/globe_east_540.jpg"; // Nos guardamos la referencia a la imagen de la tierra
                    imagen.setAttribute("src", src);
                    imagen.setAttribute("alt", "Una imagen representativa de " + componente.tema);
                    titulo.appendChild(imagen);
                    titulo.appendChild(textoTitulo);
                    
                }

            })
            .catch(function(error) {
                console.log('Ha habido un problema: \n', error);
            });

        }

    }

    customElements.define("encabezado-cuestionario", Encabezado);

})();