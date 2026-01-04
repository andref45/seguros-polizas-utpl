console.log('Starting script...');
try {
    const fs = require('fs');
    console.log('fs loaded');
    const pdf = require('pdf-parse');
    console.log('pdf-parse loaded');

    const filePath = 'c:/Users/villa/OneDrive/Documentos/ArqSoftwareBim2/seguros-polizas-utpl/arquitectura/1BimArquitecturaF.pdf';

    if (!fs.existsSync(filePath)) {
        console.error('File NOT found:', filePath);
        process.exit(1);
    }
    console.log('File found');

    const dataBuffer = fs.readFileSync(filePath);
    console.log('File read, size:', dataBuffer.length);

    pdf(dataBuffer).then(function (data) {
        console.log('PDF Parsed. Text length:', data.text.length);
        console.log('--- START TEXT ---');
        console.log(data.text);
        console.log('--- END TEXT ---');
    }).catch(err => {
        console.error('Error parsing PDF:', err);
    });
} catch (e) {
    console.error('Top level error:', e);
}
