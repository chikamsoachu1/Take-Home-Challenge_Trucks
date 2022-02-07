class Block{
    constructor(id){
      this.id=id
      //this.centre
      this.childblocks=[]
      this.isfull=false
      this.locations={}
    }
     addLoc(locid){
        // console.log(locid);
         this.locations[locid]=1            

     }
     delLoc(locid){
         delete this.locations[locid];
     }
    updateBlock(loc){
      this.locations.push(loc)
      if(this.locations.length>6)
        this.segBlock()
      
    }
    segBlock(){
  
    }
  
  }

  module.exports=Block





  /*for(let i=0;i<10;i++){
    console.log(list[i])
    console.log(geohash.encode(list[i][0], list[i][1]));
    let hash1=geohash.encode_int (list[i][0], list[i][1], bitDepth=40);
    let hash=geohash.encode(list[i][0], list[i][1]);
    //console.log(geohash.neighbors (hashstring))
    let cut=geohash.encode(list[i][0],list[i][1]).slice(0,4)
    console.log(cut)
    if(result[cut]==undefined ){
        result[cut]=1
        
    }
    else{
        result[cut]++
    }
    if(result[hash]==undefined ){
        res[hash]=1
        
    }
    else{
        res[hash]++
    }
    let cut1=hash.slice(0,3)

    //if(!blocks[cut1])
        //new Block(list[0],list[1],cut1)
}*/


   /* switch(maxd){
        case(maxd<0.55):
          stype= 1;
          break;
        case(maxd<3):
        stype= 2;
        break;
        case(maxd<18):
        stype= 3;
        break;
        case(maxd<96):
        stype= 4;
        break;
        case(maxd<388):
        stype= 5;
        break;
        case(maxd>388):
          return [];
          
       
    }*/
    