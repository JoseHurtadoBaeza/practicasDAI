'use strict';

const express = require('express'); // Cargamos el módulo de Express que devuelve una función
const app = express(); // Ejecutamos dicha función y obtenemos el objeto que representa a la aplicación en el servidor

// Cargamos y ejecutamos el contenido del fichero config.js
const config = require('./config.js');

// Inicializamos el objeto knex a null, el cual va a ser la referencia a través de la cual vamos a poder interactuar con la BD con la librería knex de Node
var knex= null;

// Inicializa Knex.js para usar diferentes bases de datos según el entorno:
function conectaBD () {
  if (knex===null) {
    var options;
    if (process.env.CARRITO_ENV === 'gae') {
      options= config.gae;
      console.log('Usando Cloud SQL (MySQL) como base de datos en Google App Engine');
    } else if (process.env.CARRITO_ENV === 'heroku') {
      options= config.heroku;
      console.log('Usando PostgreSQL como base de datos en Heroku');
    } else {
      options= config.localbd;
      console.log('Usando SQLite como base de datos local');
    }
    // La siguiente opción muestra la conversión a SQL de cada consulta:
    options.debug= true;
    knex= require('knex')(options);
  }
}

// Crea las tablas si no existen:
async function creaEsquema(res) {

  try {

    let existeTabla= await knex.schema.hasTable('cuestionarios');
    if (!existeTabla) {
      await knex.schema.createTable('cuestionarios', (tabla) => {
        tabla.increments('cuestionarioId').primary();
        tabla.string('tema', 100).notNullable();
      });
      console.log("Se ha creado la tabla cuestionarios");
    }

    existeTabla= await knex.schema.hasTable('preguntas');
    if (!existeTabla) {
      await knex.schema.createTable('preguntas', (table) => {
        table.string('preguntaId').primary();
        //table.string('temaId', 100).unsigned().notNullable(); // AQUÍ ESTABA UN ERROR AL DESPLEGAR EN LA NUBE
        table.integer('temaId').notNullable();
        table.string('textoPregunta', 100).notNullable();
        table.integer('respuestaCorrecta').notNullable(); // Verdadero/True es 1 y Falso/False es 0

        // Definimos la clave ajena:
        table.foreign('temaId').references('cuestionarios.cuestionarioId');

      });
      console.log("Se ha creado la tabla preguntas");

      existeTabla= await knex.schema.hasTable('conversionHTML');
      if (!existeTabla) {
        await knex.schema.createTable('conversionHTML', (table) => {
          table.string('estadoConversion', 10).primary(); // Recibe true o false
        });
        var conversion = {estadoConversion: "true"};
        await knex('conversionHTML').insert(conversion); // Por defecto
        console.log("Se ha creado la tabla conversionHTML");
      }
    }

  }
  catch (error) {
    console.log(`Error al crear las tablas: ${error}`);
    res.status(404).send({ result:null,error:'error al crear la tabla; contacta con el administrador' });
  }

}

async function numeroCuestionarios() {
  let n= await knex('cuestionarios').countDistinct('tema as n');
  // the value returned by count in this case is an array of objects like [ { n: 2 } ]
  return n[0]['n'];
}

async function numeroPreguntas(cuestionarioId) {
  let r= await knex('preguntas').select('preguntaId')
                                .where('temaId',cuestionarioId);
  return r.length;
}

async function existeCuestionario(tema) {
  let r= await knex('cuestionarios').select('*')
                                    .where('tema',tema);
  return r.length>0;
}

async function existeCuestionarioPorId(cuestionarioId) {
  let r= await knex('cuestionarios').select('*')
                                    .where('cuestionarioId',cuestionarioId);
  return r.length>0;
}


async function existePregunta(tema, textoPregunta) {
  let r = await knex('preguntas').select('*')
                                .where('textoPregunta',textoPregunta)
                                .andWhere('temaId', tema);

  return r.length>0;
}

async function existePreguntaPorId(preguntaId) {
  let r = await knex('preguntas').select('preguntaId')
                                .where('preguntaId',preguntaId);

  return r.length>0;
}

async function getIdCuestionario(temaCuestionario) {
  let id = await knex('cuestionarios').select('cuestionarioId')
                                      .where('tema', temaCuestionario);

  return id[0]['cuestionarioId'];
}


// Convierte el cuerpo del mensaje de la petición en JSON al objeto de JavaScript req.body:
app.use(express.json());

// Middleware para descodificar caracteres UTF-8 en la URL:
app.use( (req, res, next) => {
  req.url = decodeURI(req.url);
  next();
});

// Middleware para las cabeceras de CORS:
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS');
  res.header("Access-Control-Allow-Headers", "content-type");
  next();
});


// Middleware que establece la conexión con la base de datos y crea las 
// tablas si no existen; en una aplicación más compleja se crearía el
// esquema fuera del código del servidor:
app.use( async (req, res, next) => {
  conectaBD();
  await creaEsquema(res);
  next();
});


// Añadir un tema de cuestionario (POST) y devolver el id asignado en la base de datos:
app.post(config.app.base+'/creacuestionario/:tema', async (req,res) => {
  try {

    // Empezamos comprobando que no se haya alcanzado el máximo de cuestionarios en la BD
    /*let n= await numeroCuestionarios();
    if (n>=config.app.maxCuestionarios) {
        res.status(404).send({ result:null,error:'No caben más cuestionarios; contacta con el administrador' });
        return;
    }*/

    // Comprobamos si ya existe un cuestionario con el mismo tema
    let yaExiste = await existeCuestionario(req.params.tema);
    if (yaExiste) {
        res.status(404).send({ result:null, error:`Ya existe un cuestionario cuyo tema es ${req.params.tema}` });
        return;
    }

    var cuestionario = { tema:req.params.tema }; // Creamos un objeto de ntipo cuestionario
    await knex('cuestionarios').insert(cuestionario); // Lo insertamos e la BD

    // Obtenemos el id del cuestionario recién creado
    let idNuevoCuestionario = await getIdCuestionario(req.params.tema);

    res.status(200).send({ result:{ cuestionarioId:idNuevoCuestionario },error:null }); // Devolvemos el id del cuestionario creado

  } catch (error) {
    console.log(`No se puede crear el cuestionario: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo crear el cuestionario' });
  }
});


// Añadir una pregunta y su correspondiente respuesta a un cuestionario dado el id del tema (POST) y devolver el id de la pregunta en la base de datos
app.post(config.app.base+'/:temaId/pregunta', async (req, res) => {
  
  // Comprobamos que en el body vengan el id de la pregunta, el texto de la pregunta y la respuesta correcta
  if (!req.body.textoPregunta || !req.body.respuestaCorrecta) {
    res.status(404).send({ result:null,error:'datos mal formados para crear la pregunta' });
    return;
  }

  try {

    // Comprobamos que exista el cuestionario indicado dado el tema pasado por parámetro
    let existe = await existeCuestionarioPorId(req.params.temaId);
    if (!existe) {
      res.status(404).send({ result:null,error:`cuestionario con id ${req.params.temaId} no existente` });
      return;  
    }

    // Comprobamos si ya existe una pregunta con el mismo enunciado
    existe= await existePregunta(req.params.temaId, req.body.textoPregunta);
    if (existe) {
      res.status(404).send({ result:null,error:`ya existe una pregunta en el cuestionario con id ${req.params.temaId} con el mismo enunciado` });
      return;
    }

    // Comprobamos que no se haya excedido el número máximo de preguntas en la BD
    /*let n= await numeroPreguntas(req.params.carrito);
    if (n>=config.app.maxProductos) {
      res.status(404).send({ result:null,error:`No caben más productos en el carrito ${req.params.carrito}` });
      return;
    }*/

    var preguntaId = Math.random().toString(36).substring(7); // Generamos un id aleatorio para la pregunta

    var pregunta = { preguntaId:preguntaId,temaId:req.params.temaId,textoPregunta:req.body.textoPregunta,respuestaCorrecta:req.body.respuestaCorrecta };
    await knex('preguntas').insert(pregunta);

    res.status(200).send({ result:{preguntaId:preguntaId},error:null });

  } catch (error) {
    console.log(`No se puede añadir la pregunta: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo añadir la pregunta' });
  }

});


// Recuperar todos los temas de cuestionario (GET)
app.get(config.app.base+'/cuestionarios', async (req, res) => {
  
  try {

    let cuestionarios = await knex('cuestionarios').select('*');

    //if (cuestionarios.length > 0) {
    res.status(200).send({ result:cuestionarios, error:null });
    /*} else {
        throw new Error("No existe ningún cuestionario en la BD")
    }*/

  } catch (error) {
    console.log(`No se pueden obtener los cuestionarios: ${error}`);
    res.status(404).send({ result:null, error:`No se pueden obtener los cuestionarios: ${error}`});
  }

});


// Obtener todas las preguntas y respuestas dado el id del tema (GET)
app.get(config.app.base+'/preguntas/:cuestionarioId', async (req, res) => {

  try {
    // Empezamos comprobando que exista el cuestionario
    let existe= await existeCuestionarioPorId(req.params.cuestionarioId);
    if (!existe) {
      res.status(404).send({ result:null,error:`cuestionario ${req.params.cuestionarioId} no existente` });
      return;  
    }

    // Comprobamos que el cuestionario no esté vacío
    /*existe= await existeItem(req.params.item,req.params.carrito);
    if (!existe) {
      res.status(404).send({ result:null,error:`no hay preguntas en el cuestionario ${req.params.cuestionarioId}` });
      return;
    }*/

    let preguntasYrespuestas = await knex('preguntas').select(['preguntaId','textoPregunta','respuestaCorrecta'])
                                  .where('temaId',req.params.cuestionarioId);
    res.status(200).send({ result:preguntasYrespuestas,error:null });
  } catch (error) {
    console.log(`No se pudieron obtener las preguntas: ${error}`);
    res.status(404).send({ result:null,error:'no se pudieron obtener las preguntas' });
  }
});

// Actualiza el estado de la conversión html de todas las preguntas
app.put(config.app.base+'/editarConversionHTML/:nuevoEstado', async (req, res) => {

  try {

    await knex('conversionHTML').update('estadoConversion', req.params.nuevoEstado);

    let textoPreguntas = await knex('preguntas').select('textoPregunta');
    
    res.status(200).send({ result:textoPreguntas,error:null });
    
  } catch (error) {
    console.log(`No se pudo modificar el estado de conversion HTML de las preguntas: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo modificar el estado de conversion HTML de las preguntas' });
  }

});

// Obtiene el estado de conversión html actual
app.get(config.app.base+'/conversionHTML', async (req, res) => {

  try {

    let conversionHTML = await knex('conversionHTML').select('estadoConversion');
    
    res.status(200).send({ result:conversionHTML[0].estadoConversion,error:null });
    
  } catch (error) {
    console.log(`No se pudo obtener el estado de conversion HTML de las preguntas: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo obtener el estado de conversion HTML de las preguntas' });
  }

});


// Devuelve el texto de la pregunta recibido en markdown a html
app.put(config.app.base+'/convierte', async (req, res) => {

  // Comprobamos que en el body vengan el id de la pregunta, el texto de la pregunta y la respuesta correcta
  if (!req.body.texto) {
    res.status(404).send({ result:null,error:'datos mal formados para obtener el texto de la pregunta convertido en html' });
    return;
  }

  try {

    // Convertimos el texto en markdown recibido
    let cadenasDelTexto = req.body.texto.split(" ");
    var cadenaHTML = "";

    // Analizamos cada cadena del texto de la pregunta
    for(let i=0; i<cadenasDelTexto.length; i++){

      let regex = /\*\*[\w]+\*\*/;
      if (regex.test(cadenasDelTexto[i])){
        let regex = /\*/g;
        let replacement = "";
        let textoProcesado = cadenasDelTexto[i].replace(regex, replacement);
        replacement = `<strong>${textoProcesado}</strong>`;
        cadenasDelTexto[i] = replacement;
      }

      regex = /\*[\w]+\*/;
      if (regex.test(cadenasDelTexto[i])){
        let regex = /\*/g;
        let replacement = "";
        let textoProcesado = cadenasDelTexto[i].replace(regex, replacement);
        replacement = `<em>${textoProcesado}</em>`;
        cadenasDelTexto[i] = replacement;
      }

      regex = /\[[^)]+\)/; // Seleccionamos todo el texto
      if (regex.test(cadenasDelTexto[i])){

        let cadenas = cadenasDelTexto[i].split("]"); // Separamos el texto del enlace y el url

        let regex = /\[|\]/g; // Quitamos los corchetes a la primera cadena
        let replacement = "";
        let textoEnlace = cadenas[0].replace(regex, replacement);

        //regex = /\[[^]]+\]/;
        regex = /\(|\)/g; // Quitamos los paréntesis a la segunda cadena
        let href = cadenas[1].replace(regex, replacement);
        replacement = `<a href=${href}>${textoEnlace}</a>`;
        cadenasDelTexto[i] = replacement;

      }

      if (i == cadenasDelTexto.length-1){
        cadenaHTML += cadenasDelTexto[i];
      } else {
        cadenaHTML += cadenasDelTexto[i] + " ";
      }

    }

    // Y lo devolvemos en HTML
    res.status(200).send({ result:cadenaHTML,error:null });

  } catch (error) {
    console.log(`No se pudo convertir el texto: ${error}`);
    res.status(404).send({ result:null,error:'no se pudieron obtener el texto convertido' });
  }
});


// Borrar una pregunta dado su id (DELETE)
app.delete(config.app.base+'/pregunta/:preguntaId', async (req, res) => {

  try {

    // Comprobamos si existe alguna pregunta con el id indicado
    let existe = await existePreguntaPorId(req.params.preguntaId);
    if (!existe) {
      res.status(404).send({ result:null,error:`pregunta con id ${req.params.preguntaId} no existente` });
      return;
    }

    await knex('preguntas').where('preguntaId',req.params.preguntaId).del(); // Borramos la pregunta que corresponda al id indicado por parámetro
    res.status(200).send({ result:`pregunta con id ${req.params.preguntaId} borrada correctamente`,error:null });

  } catch (error) {
    console.log(`No se pudo borrar la pregunta: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo borrar la pregunta' });
  }

});


// Borrar un cuestionario a partir de su id y todas sus preguntas (DELETE)
app.delete(config.app.base+'/:cuestionarioId', async (req, res) => {

  try {

    // Comprobamos si existe un cuestionario con el id indicado
    let existe = await existeCuestionarioPorId(req.params.cuestionarioId);
    if (!existe) {
      res.status(404).send({ result:null,error:`No existe ningún cuestionario con id ${req.params.cuestionarioId}` });
      return;  
    }

    await knex('preguntas').where('temaId',req.params.cuestionarioId)
                           .del();
    await knex('cuestionarios').where('cuestionarioId',req.params.cuestionarioId)
                          .del();
    res.status(200).send({ result:`cuestionario con id ${req.params.cuestionarioId} borrado correctamente`,error:null });
    
  } catch (error) {
    console.log(`No se pudo encontrar el cuestionario: ${error}`);
    res.status(404).send({ result:null,error:'no se pudo encontrar el cuestionario' });
  }

});


// borra toda la base de datos:
/*app.get(config.app.base+'/clear', async (req,res) => {
  try {
    await knex('productos').where('carrito',req.params.carrito)
                           .del();
    await knex('carrito').where('nombre',req.params.carrito)
                         .del();
    res.status(200).send({ result:'ok',error:null });
  } catch (error) {
    console.log(`No se pudo borrar la base de datos: ${error}`);
  }
});*/


const path = require('path');
const { read } = require('fs');
const publico = path.join(__dirname, 'public');
// __dirname: directorio del fichero que se está ejecutando

app.get(config.app.base+'/', (req, res) => {
  res.status(200).send('API web para gestionar los cuestionarios y las preguntas');
});

app.get(config.app.base+'/ayuda', (req, res) => res.sendFile(path.join(publico, 'index.html')));

app.use('/', express.static(publico));

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Aplicación lanzada en el puerto ${ PORT }!`);
});
