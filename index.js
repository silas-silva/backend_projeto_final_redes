const express = require('express');
const cors = require('cors');
const extract = require('extract-zip')
const multer = require('multer');
const fs = require('fs');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Renomeia o arquivo com a extensão .zip
    }
});
const upload = multer({ storage: storage });
const uploadPath = require('./public/src/credenciais/apiCredenciais')


app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE"); // Release which methods will be allowed access
    app.use(cors());
    next();
})
app.use(express.static(path.join(__dirname, "public/src/credenciais")));
app.use(express.urlencoded({extended:true}))
app.use(express.json());


//rotas
app.get('/', (request, response) => {
    return response.status(500).send("Rota 1");
});


app.post('/upload', upload.single('zipFile'), async (req, res) => {
    const zipFilePath = req.file.path; //Pegar o caminho para o arquivo zip
    const extractionPath = req.file.originalname.replace('.zip', '');

    // Cria uma pasta com o nome do arquivo extraido
    fs.mkdir(extractionPath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Pasta criada com sucesso!');
      }
    });
  
    try {  
      await extractZip(zipFilePath, extractionPath);
  
      // Excluir o arquivo zip
      fs.unlink(zipFilePath, (err) => {
        if (err) {
          console.error(err);
        }
      });

      const data  = await uploadPath(extractionPath)
      console.log("Arquivos enviados");
      console.log(data);

      fs.rm(extractionPath, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Pasta removida com sucesso.');
      });
  
      res.status(200).send('Extração completa e envio completo');
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro durante a extração do arquivo zip');
    }
});


// Funções
async function extractZip(zipFilePath, extractionPath) {
    try {
        const absoluteExtractionPath = path.resolve(extractionPath); // Obter o caminho absoluto
        await extract(zipFilePath, { dir: absoluteExtractionPath });
        console.log('Extração completa');
    } catch (err) {
        // Tratar qualquer erro
        console.error(err);
        throw new Error('Erro durante a extração do arquivo zip');
    }
}


app.listen(port, (err) => {
    if (err) {
        console.log("❌ Não foi possível iniciar o servidor ❌");
    }else{
        console.log("ACESSE: http://localhost:3000/")
    }
});