var list=require('./listfile')
var geohash = require('ngeohash');
var Block=require('./Block.js');
var memory=requre('.loadder.js');
const {pulldata}=memory;
pulldata();
//console.log(geohash.encode(37.832444, 112.558455));
// prints ww8p1r4t8
var latlon = geohash.decode('ww8p1r4t8');
//console.log(geohash.decode_bbox('ww8p1r4t8'));
//console.log(latlon.latitude);
//console.log(latlon.longitude);
result=[]
Bstring=[]
blocks=[]
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
        cBlock=blocks[cut].addLoc(locid)
        makeblocker(locid,hash,ind+1)   
        
    
}
class point{
    constructor(lat,long,locid){
        this.lat=lat;
        this.long=long;
        this.locid=locid;
        this.hash=hash
    }
}
blocks=[]
Bstring=[]
Locationsdb={};
for(let i=0;i<2;i++){
   let locid=list[i][2];
   let  latt=list[i][0];
   let long= list[i][1];
   
   //insert locations and locid into mapping
   Locationsdb[locid]=[latt,long]
   hash=(geohash.encode(list[i][0], list[i][1]));

   makeblocker(locid,hash,3)
  
}
//lister=list[6]
/*hash=(geohash.encode(lister[0], lister[1]));
neighbours=geohash.neighbors('9q8y');
//console.log(hash.slice(0,6));
for (nei of neighbours){
    //console.log(nei);
    if(nei in blocks){
       //console.log(nei);
       //console.log(blocks[nei].locations.length)
    }
}*/
//console.log(blocks['9q8yy']);
//console.log(Bstring);

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
    console.log(stype);
    console.log(hash);
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
    for (nei of locations){
        //console.log(nei);
        //console.log(blocks[nei].locations)
        var locobj=blocks[nei].locations
        for(let locid of Object.keys(locobj)){
            pos=Locationsdb[locid];
            if(getDistanceFromLatLonInKm(pos[0],pos[1],lat,long)<maxd){
                results=[...results,pos];
            }

        }
        

        
       
    
    }
    

  console.log(results)
 
    
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
    delete Locationsdb[locid];
    


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
    Locationsdb[locid]=[nlat,nlon] ;

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
console.log(Bstring)
//console.log(Locationsdb)
updateid(1591847, 37.74099473505000, -122.4011723355000 );
console.log(Bstring)
//console.log(Locationsdb)
//search(37.7570155, -122.3940629,.07)
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