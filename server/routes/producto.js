const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');
const _ = require('underscore');

//obtener todos los productos
app.get('/producto', verificarToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

//obtener un producto por ID
app.get('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontro el producto con ese ID'
                    }
                })
            }

            res.json({
                ok: true,
                producto
            })
        })
})

//busca un producto por coincidencia
app.get('/producto/buscar/:termino', verificarToken, (req, res) => {
    let termino = req.params.termino;

    let regEx = new RegExp(termino);

    Producto.find({ nombre: regEx })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })
        })
})

//crea un producto
app.post('/producto', verificarToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: true,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo crear el producto'
                }
            })
        }

        res.json({
            ok: true,
            producto
        })
    })
})

//actualiza un producto
app.put('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontro el producto con ese ID'
                }
            })
        }

        res.json({
            ok: true,
            producto
        })
    })

})

//borrar un producto
app.delete('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let disponible = {
        disponible: false
    }


    Producto.findByIdAndUpdate(id, disponible, { new: true, runValidators: true }, (err, producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontro el producto con ese ID'
                }
            })
        }

        res.json({
            ok: true,
            producto
        })

    })
})


module.exports = app;