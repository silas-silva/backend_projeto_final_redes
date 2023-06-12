const { google } = require('googleapis');
const fs = require('fs');

// Caminho para credenciais do arquivo JSON
const CREDENTIALS = './google-drive-credenciais.json';
// Escopo necessário para acessar o Google Drive
const SCOPES = 'https://www.googleapis.com/auth/drive';
// Id da pasta no google drive
const GOOGLE_API_FOLDER_ID = '1SF7Pu59HN6sE4xdeSnDlgQnUgTq4da9z';

async function uploadPath(folderPath){
  try {
    const authClient = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS,
      scopes: [SCOPES]
    })
  
    const driveService = google.drive({
      version: 'v3',
      auth: authClient
    })
    dataAtual = new Date();
    stringData = dataAtual.getDate() + "-" + (dataAtual.getMonth() + 1) + "-"  + dataAtual.getFullYear()
    const fileMetaDataPath = {
      name: folderPath + ":" + stringData,
      parents: [GOOGLE_API_FOLDER_ID],
      mimeType: 'application/vnd.google-apps.folder',
    }
    
    const links = [];

    try {
      const folder = await driveService.files.create({
        resource: fileMetaDataPath,
        fields: 'id',
      });

      const files = await fs.promises.readdir(folderPath);

      for (const file of files) {
        const filePath = `${folderPath}/${file}`;

        const fileMetaData = {
          'name': file,
          'parents': [folder.data.id]
        };

        const media = {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(filePath)
        };

        const uploadedFile = await driveService.files.create({
          resource: fileMetaData,
          media: media
        });

        links.push('https://drive.google.com/uc?export=view&id=' + uploadedFile.data.id);
      }
    } catch (err) {
      console.error('Error:', err);
    }

    return links;

  } catch (error) {
    console.log('Erro ao criar arquivo! \n=> ', error)
  }
}

module.exports = uploadPath