require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');
const app = express();


// Connect to database
mongoose.connect(process.env.MONGO_URI , { useNewUrlParser: true })

const shorturlschema = new mongoose.Schema({
  original_url: String,
  id: Number
})

const ShortURL = mongoose.model('ShortURL',shorturlschema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl',bodyparser.urlencoded({ extended: false }),(req,res)=>{
  try{
    var url = new URL(req.body.url);
    dns.lookup(url.host,async (err, address) =>
        {
          if (err) {res.json({error: 'invalid url'});}else{
            let id = await ShortURL.countDocuments({}) + 1;
            ShortURL.create({original_url: req.body.url,id},(err,data)=>{
              if(err) throw 'unknown error';
              console.log(short.original_url +" created " + id);
              res.json({original_url:req.body.url,short_url:id});
            });
          }
        });
    
  }catch(x){
    res.json({error: x});
  }
  

});

app.get('/api/shorturl/:id',async (req,res)=>{
  var short = await ShortURL.findOne({id:req.params.id});
  console.log(short.original_url +" redirected");
  res.redirect(short.original_url);
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
