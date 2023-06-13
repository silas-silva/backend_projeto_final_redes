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
const axios = require('axios');


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
    
    const {ano, tipo} = req.body

    //console.log(ano);
    //console.log(tipo);
    
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

      const data = await uploadPath(extractionPath)
      console.log("Arquivos enviados");
      
      console.log(data);

      fs.rm(extractionPath, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Pasta removida com sucesso.');
      });

      // Os links estão em data, fazer um for e mandar cada  link para o OCR
      processarArrayLinksAsync(data).then(() => {
        console.log('Arquivos armazenados');
      })
      .catch((error) => {
        console.error('Erro:', error);
      });

  
      res.status(200).send(data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro durante a extração do arquivo zip');
    }
});


app.post('/buscar', (req, res) => {
  //Pegar dados
  const {palavrasChave, dataInicio, dataFim} = req.body
  // Mandar para a rota de busca

  // Receber os dados e guardarem data
  const data = {palavrasChave, dataInicio, dataFim}

  res.status(200).send(data);
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


const executeOCRassincrono = (item) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Fazer logica para mandar pro OCR aqui.
      const headers = {
        'Content-Type': 'application/json'
      };
      
      const data = {
        link: item
      };
      
      axios.post('https://exa844.rj.r.appspot.com/', data, { headers })
        .then(response => {
          // Esperar o OCR responder
          dados = response.data;          
          // Mandar a resposta para o armazenamento, para os dados serem armazenados
          const data = {
            dados
          };
          // data[""] = ""
          
          // axios.post('https://dbr-engenho-de-busca.onrender.com/cadastrarResolucao', data)
          //   .then(response => {
          //     // Esperar o OCR responder
          //     console.log(response.data);
          //     // https://dbr-engenho-de-busca.onrender.com/cadastrarResolucao
              
          //     // Mandar a resposta para o armazenamento, para os dados serem armazenados
          //   })
          //   .catch(error => {
          //     console.error(error);
          //   });
        })
        .catch(error => {
          console.error(error);
        });
      resolve(); // Resolvendo a promessa após a operação ser concluída
    }, 1000);
  });
};


const processarArrayLinksAsync = (array) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const item of array) {
        console.log("Arquivo: " + item)
        await executeOCRassincrono(item);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};


app.listen(port, (err) => {
    if (err) {
        console.log("❌ Não foi possível iniciar o servidor ❌");
    }else{
        console.log("ACESSE: http://localhost:3000/")
    }
});