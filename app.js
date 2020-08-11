const inicioDebug = require('debug')('app:inicio');
//const dbDebug = require('debug')('app:db');

const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('@hapi/joi');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Configuracion de entornos
console.log('Aplicacion : ' + config.get('nombre'));
console.log('BD Server  : ' + config.get('configDB.host'));

//Uso middeleware de terceros Morgan
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    //console.log('morgan habilitado');
    inicioDebug('Morgan esta habilitado');
}

//base de datos
inicioDebug('conectando con la base de datos...');


//app.use(logger);

app.use(function(req, res, next) {
    console.log('autenticando');
    next();
})



const usuarios = [
    { id: 1, nombre: 'juve' },
    { id: 2, nombre: 'ana' },
    { id: 3, nombre: 'marcela' }
];

app.get('/', (req, res) => {
    res.send('Hola mundo desde Express');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(parseInt(req.params.id));
    if (!usuario) res.status(404).send('el usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {

    // const schema = Joi.object({
    //     nombre: Joi.string().min(3).required()
    // });

    const { error, value } = validarUsuario(req.body.nombre);
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

});

app.put('/api/usuarios/:id', (req, res) => {
    //encontrar el id
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(parseInt(req.params.id));
    if (!usuario) {
        res.status(404).send('el usuario no fue encontrado');
        return;
    }

    const { error, value } = validarUsuario(req.body.nombre);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(parseInt(req.params.id));
    if (!usuario) {
        res.status(404).send('el usuario no fue encontrado');
        return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuarios);
})

const port = 3000; //process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Escuchando el puerto ${port}...`);
});

function existeUsuario(id) {
    return (usuarios.find(u => u.id === id));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    return (schema.validate({ nombre: nom }));

}