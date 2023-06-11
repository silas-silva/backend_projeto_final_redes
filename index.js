const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "public/src")));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

//rotas
app.get('/', (request, response) => {
    return response.status(500).send("Rota 1");
});


app.listen(port, (err) => {
    if (err) {
        console.log("❌ Não foi possível iniciar o servidor ❌");
    }else{
        console.log("ACESSE: http://localhost:3000/")
    }
});