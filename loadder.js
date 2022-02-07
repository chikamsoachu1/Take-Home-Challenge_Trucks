/*
This file holds the functions and neccessary data to run the api code
It exports all the neccessary functions for data interaction in such a way to decouple api  logic and control logic/business logic

*/
const data= require('./csvjson.json');
const geohash = require('ngeohash');

const Block=require('./Block.js');
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
recursivedelete=function(locid,hash,ind){
    console.log("first")
    if (ind==8)
    return
    let cut=hash.slice(0,ind)
    console.log(cut)
    if(blocks[cut]==undefined){
        
        return

    }
    
        console.log(Bstring[cut])
        Bstring[cut]--
        console.log(Bstring[cut])
        blocks[cut].delLoc(locid)
        recursivedelete(locid,hash,ind+1)   
    

}

deleteid= function(locid){
    let [long,lat]=Locationsdb[locid];
    let hash=geohash.encode(lat,long);
    recursivedelete(locid,hash,3);
    delete map[locid];
    


}

updateid=function(locid ,nlat,nlon){
    if(Locationsdb[locid]==undefined)
        return;
    [lat,lon]=Locationsdb[locid];
    let hash1=geohash.encode(lat,lon);
    let hash2=geohash.encode(nlat,nlon);
    console.log(hash1 ,hash2);
    ind=compare(hash1,hash2);
    console.log(Bstring)
    recursivedelete(locid,hash1,ind);
    console.log(Bstring)
    makeblocker(locid,hash2,ind);
    map[locid].Location=[nlat,nlon] ;
    map[locid].Longitude=nlon;
    map[locid].Latitude=nlat;

}
compare=function(word1,word2){
    if(word1.slice(0,3)!=word2.slice(0,3))
        return 3
    for(let i=3;i<8;i++){
        if(word1[i]!=word2[i]){
            return i+1;
        }
    }
    return i+1;
}
function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
var R = 3958.8; // Radius of the earth in km
var dLat = deg2rad(lat2-lat1);  // deg2rad below
var dLon = deg2rad(lon2-lon1); 
var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
var d = R * c; // Distance in km
return d;
}

search= function(lat,long,maxd){
    let stype
    
    if(maxd>388 || maxd<0){
        return []
    }
    
    let levels=[0.095,0.55,3,18,96,388]
    for(let i=0;i<6;i++){
        if(maxd<levels[i]){
            stype=i
            break

        }
    }

    let hash=geohash.encode(lat,long).slice(0,(7-stype))
   
    let neighbours=geohash.neighbors(hash);
    let locations=[]
    if(hash in blocks){
       locations.push(hash);
    }
    
    for (nei of neighbours){
        //console.log(nei);
        if(nei in blocks){
           //console.log(nei);
           locations.push(nei)
           //console.log(blocks[nei].locations)
        }
       
    
    }
    results=[]
    count=0
    for (nei of locations){
        //console.log(nei);
        //console.log(blocks[nei].locations)
        var locobj=blocks[nei].locations
        for(let locid of Object.keys(locobj)){
            let lat1=map[locid].Latitude;
            //lat1=parseInt(lat1);
            count++
            let lon1=map[locid].Longitude;
            
            //lon1=parseInt(lon1);
            console.log(getDistanceFromLatLonInKm(lat1,lon1,lat,long))
            
            if(getDistanceFromLatLonInKm(lat1,lon1,lat,long)<maxd){
                
                results=[...results,map[locid]];
            }

        }
        

        
       
    
    }
    
console.log(count)
  return results;
 

}

//console.log(Bstring)
//console.log(Locationsdb)
//updateid(1591847, 37.74099473505000, -122.4011723355000 );
//console.log(Bstring)
//console.log(Locationsdb)
//search(37.7570155, -122.3940629,.05)

pulldata= function(){
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
console.log('we done ');
}
getlocation_locid =function(locid){
    return map[locid];

}

updatelocation_locid=function(req){
    let locid=req.params.locid
    let body= req.body;
    if(map[locid]==undefined)
        return null;
    // check if all keys are keys
    console.log(map[locid]);
    for(keys in body){
        map[locid][keys]=body[keys];
        if(keys=='location'){
            updateid(locid,body.Latitude,body.Longitude)
        }
        //update blcokmap
    }
    return map[locid]
}
getblock_blockid=function(req){
    

    const rblock=blockMap[req.params.blockid];
    if(rblock==undefined)
        return undefined
    let block_locations=rblock.locations
    

    for(let ind=0;ind<block_locations.length;ind++){
        let locid=rblock.locations[ind]
        rblock.locations[ind]=map[locid];
    }
    return rblock;
}
createlocation_locid=function(req){
    const obj={}
    let body=req.body;
    let locid=body.locationid;
    let blockid=body.block;
    let lat=body.Latitude;
    let lon=body.Longitude;
    console.log(body);
    for(keys in body){
        obj[keys]=body[keys];
    }
    if(locid in map)
        return "Error Locid stored already"
    map[locid]=obj;
    if(blockMap[blockid]==undefined){
        let block_obj={ blockid:blockid,locations:[]};
                       
               
        blockMap[blockid] =block_obj;
    }
    blockMap[blockid].locations.push(locid);
    create_ghash(locid,lat,lon);
    
    return "stored"

}
module.exports={ pulldata,getlocation_locid,getblock_blockid,updatelocation_locid,createlocation_locid,search}
