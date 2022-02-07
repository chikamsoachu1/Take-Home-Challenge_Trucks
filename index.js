const list=require('./listfile');
const geohash = require('ngeohash');
const Block=require('./Block.js');
const express = require('express');
const app=express();
app.use(express.json());
const data= require('./csvjson.json');
map={}
blockMap={}
result=[]
Bstring=[]
blocks=[]
var memory=require('./loadder.js');
const {pulldata,getlocation_locid,updatelocation_locid,getblock_blockid,createlocation_locid,search}=memory;
//
pulldata();
makeblocker=function(locid,hash,ind){
    if (ind==8)
        return
    let cut=hash.slice(0,ind)
    
    if(Bstring[cut]==undefined){
        
        const block1 =new Block(cut)
        blocks[cut]=block1
        Bstring[cut]=0

    }
    
        Bstring[cut]++
        blocks[cut].addLoc(locid)
        makeblocker(locid,hash,ind+1)   
        
    
}
create_ghash=function(locid,latt,long){
    //insert locations and locid into mapping
  
  let hash=(geohash.encode(latt, long));

  makeblocker(locid,hash,3)
}
for(let loc of data){
    let locid=loc.locationid;
    let blockid=loc.block;
    let lat=loc.Latitude;
    let lon=loc.Longitude;
    map[loc.locationid]=loc;
    
    if(blockMap[blockid]==undefined){
        let block_obj={ blockid:blockid,locations:[]};
                       
               
        blockMap[blockid] =block_obj;
    }
    blockMap[blockid].locations.push(locid);
    create_ghash(locid,lat,lon);

}
//console.log(blocks);


 
app.get('/trucks',(req,res)=>{
    res.send('Welcome To food Trucks online')
});
app.get('/api/trucks/locations/:locid',(req,res)=>{
    const locc=getlocation_locid(req.params.locid);
    res.send(locc);
    
});
app.put('/api/trucks/locations/:locid',(req,res)=>{
    const r=updatelocation_locid(req);
    if(r==null)
        res.status(404).send('This is an invalid locationid');
    // check if all keys are keys
   
    res.send(r);

});
app.get('/api/trucks/locations',(req,res)=>{
    let lat =parseFloat(req.query.lat);
    let lon =parseFloat(req.query.lon);
    let maxd=parseInt(req.query.maxd);
    
    const c_response=search(lat,lon,maxd);
    res.send(c_response);
    

});
app.get('/api/trucks/block/:blockid',(req,res)=>{
    const block_obj=getblock_blockid(req)
    if(block_obj==null)
        res.status(404).send('This is an invalid blockid');

    res.send(block_obj);
    
});

app.post('/api/trucks/locations',(req,res)=>{
   const c_res= createlocation_locid(req);
   if(c_res=="Error Locid stored already")
      res.status(404).send(c_res);
    
    res.send(req.body);
    
});

const port =process.env.PORT|| 5000;
app.listen(port,()=> console.log('listening on port'));






  
  



