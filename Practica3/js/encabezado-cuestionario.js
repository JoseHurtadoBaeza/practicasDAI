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

    <h2><img src="" alt="">Cuestionario sobre </h2>
    <div class="wiki"></div>`;

    class Encabezado extends HTMLElement {

        constructor() {
            super();
            let clone = template.content.cloneNode(true);
            let shadowRoot = this.attachShadow({
                mode: 'open'
            });
            shadowRoot.appendChild(clone);
        }

        connectedCallback() {
            
            var componente = this;
            this.tema = this.hasAttribute('data-tema')?this.getAttribute('data-tema'):0;
            this.shadowRoot.querySelector("h2").innerHTML += this.tema;
            this.shadowRoot.querySelector("img").setAttribute("alt", "Una imagen representativa de " + this.tema);
        
            fetch('https://es.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&continue&titles=' + componente.tema)
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
        
                componente.shadowRoot.querySelector(".wiki").textContent = textoProcesado;
        
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
            
                        let src = responseAsObject.sizes.size[0].source; // Nos guardamos la referencia a la imagen con el formato más compacto que es la primera
                        componente.shadowRoot.querySelector("h2 img").setAttribute("src", src);
            
                    })
                    .catch(function(error) {
                        console.log('Ha habido un problema: \n', error);
                    })

                }
                else { // Sino
                    componente.shadowRoot.querySelector("h2 img").setAttribute("src", "./img/globe_east_540.jpg");
                }

            })
            .catch(function(error) {
                console.log('Ha habido un problema: \n', error);
            });

        }

    }

    customElements.define("encabezado-cuestionario", Encabezado);

})();