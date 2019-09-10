const express = require('express');
let { verificarToken, verificarRol } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');
const _ = require('underscore');


//muestra todas las categorias
app.get('/categoria', verificarToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let hasta = req.query.limite || 5;
    hasta = Number(hasta);

    Categoria.find()
        .skip(desde)
        .limit(hasta)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categorias
            })
        })
})

//muestra una categoria por ID
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

//crea una categoria
app.post('/categoria', verificarToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

//actualiza la categoria
app.put('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

//borra una categoria
app.delete('/categoria/:id', [verificarToken, verificarRol], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            categoria
        })
    })
})

module.exports = app;