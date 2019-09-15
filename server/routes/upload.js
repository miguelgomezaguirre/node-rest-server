const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: ({
                message: "No se subio ningun archivo"
            })
        })
    }

    //validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: ({
                message: "El tipo no es valido"
            })
        })
    }

    let archivo = req.files.archivo;
    let nombreArchivoSplit = archivo.name.split('.');
    let extension = nombreArchivoSplit[nombreArchivoSplit.length - 1];

    let extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: ({
                message: "El formato no esta dentro de las extensiones permitidas (" + extensionesValidas.join(', ') + ")",
                ext: extension
            })
        })
    }

    //cambio de nombre al archivo para que sea unico
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    })
})

function imagenUsuario(id, res, nombreArchivo) {

    let img = {
        img: nombreArchivo
    }

    Usuario.findByIdAndUpdate(id, img, (err, usuario) => {
        if (err) {
            borrarImagen('usuarios', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuario) {
            borrarImagen('usuarios', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe '
                }
            })
        }

        borrarImagen('usuarios', usuario.img);

        res.json({
            ok: true,
            usuario,
            img
        })

    })
}

function imagenProducto(id, res, nombreArchivo) {

    let img = {
        img: nombreArchivo
    }

    Producto.findByIdAndUpdate(id, img, (err, producto) => {
        if (err) {
            borrarImagen('productos', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!producto) {
            borrarImagen('productos', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe '
                }
            })
        }

        borrarImagen('productos', producto.img);

        res.json({
            ok: true,
            producto,
            img
        })
    })


}

function borrarImagen(tipo, nombreArchivo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }

}

module.exports = app;