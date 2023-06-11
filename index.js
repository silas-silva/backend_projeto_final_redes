const express = require('express');
const cors = require('cors');
const extract = require('extract-zip')
const multer = require('multer');

const app = express();
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 3000

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE"); // Release which methods will be allowed access
    app.use(cors());
    next();
})

app.use(express.static(path.join(__dirname, "public/src")));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

//rotas
app.get('/', (request, response) => {
    return response.status(500).send("Rota 1");
});

app.post('/upload', upload.single('zipFile'), async (req, res) => {
    const zipFilePath = req.file.path; //Pegar o caminho para o arquivo zip
    const extractionPath = 'extracted/';
  
    try {
      const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
      const extractedPath = `${extractionPath}${uniqueFileName}`;
  
      await extractZip(zipFilePath, extractedPath);
  
      // Excluir o arquivo zip
      fs.unlink(zipFilePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
  
      res.status(200).send('Extração completa');
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro durante a extração do arquivo zip');
    }
  });

// Função para extrair o arquivo zip
async function extractZip(zipFilePath, extractionPath) {
    try {
      await extract(zipFilePath, { dir: extractionPath });
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