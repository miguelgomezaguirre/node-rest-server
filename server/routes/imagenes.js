const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificarTokenImg } = require('../middlewares/autenticacion');
let app = express();

app.get('/imagenes/:tipo/:img', verificarTokenImg, (req, res) => {
    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
    let tipo = req.params.tipo;
    let img = req.params.img;

    let imagePath = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.sendFile(noImagePath);
    }
})


module.exports = app;