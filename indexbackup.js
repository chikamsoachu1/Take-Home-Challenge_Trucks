var list=require('./listfile')
var geohash = require('ngeohash');
var Block=require('./Block.js')
//console.log(geohash.encode(37.832444, 112.558455));
// prints ww8p1r4t8
var latlon = geohash.decode('ww8p1r4t8');
//console.log(geohash.decode_bbox('ww8p1r4t8'));
//console.log(latlon.latitude);
//console.log(latlon.longitude);
result=[]
Bstring=[]
blocks=[]
makeblocker=function(lat,long,hash,ind){
    if (ind==8)
        return
    let cut=hash.slice(0,ind)
    
    if(Bstring[cut]==undefined){
        
        const block1 =new Block(cut)
        blocks[cut]=block1
        Bstring[cut]=0

    }
    
        Bstring[cut]++
        cBlock=blocks[cut].addLoc(lat,long)
        makeblocker(lat,long,hash,ind+1)   
        
    
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

for(let i=0;i<list.length;i++){
   latt=list[i][0];
   long= list[i][1];
   hash=(geohash.encode(list[i][0], list[i][1]));

   makeblocker(latt,long,hash,3)
  
}
lister=list[6]
hash=(geohash.encode(lister[0], lister[1]));
neighbours=geohash.neighbors('9q8y');
//console.log(hash.slice(0,6));
for (nei of neighbours){
    //console.log(nei);
    if(nei in blocks){
       //console.log(nei);
       //console.log(blocks[nei].locations.length)
    }
}
//console.log(blocks["9q8zn"].locations);
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
       locations.push(hash)
    }
    count=0
    for (nei of neighbours){
        //console.log(nei);
        if(nei in blocks){
           console.log(nei);
           locations.push(nei)
           console.log(blocks[nei].locations)
        }
        count++;
    
    }
    results=[]
    for (nei of locations){
        //console.log(nei);
        //console.log(blocks[nei].locations)
        for(let pos of blocks[nei].locations){
            if(getDistanceFromLatLonInKm(pos[0],pos[1],lat,long)<maxd){
                results=[...results,pos];
            }

        }
        

        
       
    
    }

  console.log(results)
 
    
}
search(37.7570155, -122.3940629,.07)
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