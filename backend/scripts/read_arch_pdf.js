const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/villa/OneDrive/Documentos/ArqSoftwareBim2/seguros-polizas-utpl/arquitectura/1BimArquitecturaF.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error(err);
});
