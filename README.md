#FOOD TRUCK REST API example application

This is a  simple REST api to query food truck location data and help it users find food trucks in an area. Users can query food truck by food truck location id , users can also query all the food trucks in an area and also add food trucks.In addition users can query all the food trucks in  a certain radius  from a location via its lattitude and longitude
## Development

This API was developed to query public information about food trucks from https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data. The api is     developed around the structure of the given dataset.
    
**Challenges**
       The biggest challenge in creating this api is the problem of efficiently storing and also searching a large data set such as the above. This problem is solved generally           with the idea of partitioning the data based on  blocks, lat long etc.
    
  
## DEEP DIVE
  The data for each location is represented as below in the sample JSON object
       
       
       {
        "locationid": 1571953,
        "Applicant": "The Geez Freeze",
        "FacilityType": "Truck",
        "cnn": 887000,
        "LocationDescription": "18TH ST: DOLORES ST to CHURCH ST (3700 - 3799)",
        "Address": "3750 18TH ST",
        "blocklot": 3579006,
        "block": 3579,
        "lot": "006",
        "permit": "21MFF-00015",
        "Status": "APPROVED",
        "FoodItems": "Snow Cones: Soft Serve Ice Cream & Frozen Virgin Daiquiris",
        "X": 6004575.869,
        "Y": 2105666.974,
        "Latitude": 37.76201920035647,
        "Longitude": -122.42730642251331,
        "Schedule": "http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=21MFF-00015&ExportPDF=1&Filename=21MFF-   ",
        "NOISent": "",
        "Approved": "01/28/2022 12:00:00 AM",
        "Received": 20210315,
        "PriorPermit": 0,
        "ExpirationDate": "11/15/2022 12:00:00 AM",
        "Location": "(37.76201920035647, -122.42730642251331)"
      }
 Each object has a  block number which was used  as map key to store all the  locations with simiilar blockids. However to prevent storing info multiple times we  store just the location id and retrieve  location details fromt the master store of data.
 This is a pattern used tbrough out the code  we store the locations only once in a map that maps (locationid=> location details).
  This map is used to retrieve location details when we have to search for a location by locationid  and also when we want to retrieve a locations detail any where else in the code.
## Finding the nearest locations  to a point

A naive way to perform this kind of search would be to loop through all the locations and find all the locations that have a distance less than or equal to the search    distance parameter, however because the size of our database is potentially very large this kind of search would be  very expensive.Thus we implement the concept of geosharding using the ngeoshard library.

The basic concepts of geosharding are outlined here https://eugene-eeo.github.io/blog/geohashing.html#1. And graphic description here http://www.movable-type.co.uk/scripts/geohash.html
  
With Geosharding we can take a lattitude and longitude and convert it to a geoshard hash.Each digit of  the hash represents a certain degree of precision.THat is 
        
        digit  Precision
        1	≤ 5,000km	×	5,000km
        2	≤ 1,250km	×	625km
        3	≤ 156km	×	156km
        4	≤ 39.1km	×	19.5km
        5	≤ 4.89km	×	4.89km
        6	≤ 1.22km	×	0.61km
        7	≤ 153m	×	153m
        8	≤ 38.2m	×	19.1m
        
 We use this concept to efficently store food truck locations  and efficiently create a proximity search for these locations.
 To store
 We convert a food trucks location to a geoshard . Create a custom class called a block that can store a geoshard id and all the locations in that geoshard. 
  To search 
   We map a search parameter to a digit of geoshard precision and search  for a block with similar precision, once the block is founnd we add it and all its neighbouring blcoks to a list and iterate through all the locations of the blocks for the  locations that are withing the rannge.
   Thus  greatly reducign the number of locations needed to be searched.

# REST API

The REST API to the example app is described below.

## Get a  Truck Location by locationid

### Request
  


http://localhost:5000/api/trucks/locations/1591846

### Response

    {"locationid":1591846,"Applicant":"Golden Gate Halal Food","FacilityType":"Push Cart","cnn":8749101,"LocationDescription":"MARKET ST: MASON ST \\ TURK ST to 06TH ST \\ GOLDEN GATE AVE \\ TAYLOR ST (943 - 999) -- SOUTH --","Address":"979 MARKET ST","blocklot":3704068,"block":3704,"lot":"068","permit":"22MFF-00025","Status":"SUSPEND","FoodItems":"Pulao Plates & Sandwiches: Various Drinks","X":6009863.636,"Y":2112937.779,"Latitude":37.78228077241861,"Longitude":-122.40953118731998,"Schedule":"http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=22MFF-00025&ExportPDF=1&Filename=22MFF-00025_schedule.pdf","NOISent":"","Approved":"","Received":20220126,"PriorPermit":0,"ExpirationDate":"11/15/2022 12:00:00 AM","Location":"(37.78228077241861, -122.40953118731998)"}

## Get a Truck Locations by blockid

### Request
  


http://localhost:5000/api/trucks/block/0266

### Response

  {"blockid":"0266",
  "locations":[{"locationid":839523,"Applicant":"Halal Cart of San Francisco","FacilityType":"Push Cart","cnn":8741201,"LocationDescription":"MARKET ST:          FREMONT ST \\      FRONT ST to 01ST ST \\ BUSH ST (400 - 498) -- NORTH --","Address":"1 FRONT ST","blocklot":"0266009","block":"0266","lot":"009","permit":"16MFF-  0 136","Status":"REQUESTED","FoodItems":"Gyro; Chicken over rice; Gyro over rice;","X":6013006.032,"Y":2116325.123,"Latitude":37.791757205944414,"Longitude":-122.39889763689186,"Schedule":"http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=16MFF-0136&ExportPDF=1&Filename=16MFF-   0136_schedule.pdf","NOISent":"","Approved":"","Received":20160812,"PriorPermit":0,"ExpirationDate":"","Location":"(37.791757205944414, -122.39889763689186)"},
  
  {"locationid":839523,"Applicant":"Halal Cart of San Francisco","FacilityType":"Push Cart","cnn":8741201,"LocationDescription":"MARKET ST: FREMONT ST \\ FRONT ST to 01ST ST \\ BUSH ST (400 - 498) -- NORTH --","Address":"1 FRONT ST","blocklot":"0266009","block":"0266","lot":"009","permit":"16MFF-0136","Status":"REQUESTED","FoodItems":"Gyro; Chicken over rice; Gyro over rice;","X":6013006.032,"Y":2116325.123,"Latitude":37.791757205944414,"Longitude":-122.39889763689186,"Schedule":"http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=16MFF-0136&ExportPDF=1&Filename=16MFF-0136_schedule.pdf","NOISent":"","Approved":"","Received":20160812,"PriorPermit":0,"ExpirationDate":"","Location":"(37.791757205944414, -122.39889763689186)"}]}

## Get all truck locations  maxd distance from lattiude lat and longitude lon

### Request
  

http://localhost:5000/api/trucks/locations?lat=37.7570155&lon=-122.3940629&maxd=.07

### Response
 Returns an array list of objects .07 miles to the location


## Create a new Location

### Request

`POST /thing/`

    http://localhost:5000/api/trucks/locations
    {
    "locationid": 1571953,
    "Applicant": "The Geez Freeze",
    "FacilityType": "Truck",
    "cnn": 887000,
    "LocationDescription": "18TH ST: DOLORES ST to CHURCH ST (3700 - 3799)",
    "Address": "3750 18TH ST",
    "blocklot": 3579006,
    "block": 3579,
    "lot": "006",
    "permit": "21MFF-00015",
    "Status": "APPROVED",
    "FoodItems": "Snow Cones: Soft Serve Ice Cream & Frozen Virgin Daiquiris",
    "X": 6004575.869,
    "Y": 2105666.974,
    "Latitude": 37.76201920035647,
    "Longitude": -122.42730642251331,
    "Schedule": "http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=21MFF-00015&ExportPDF=1&Filename=21MFF-00015_schedule.pdf",
    "NOISent": "",
    "Approved": "01/28/2022 12:00:00 AM",
    "Received": 20210315,
    "PriorPermit": 0,
    "ExpirationDate": "11/15/2022 12:00:00 AM",
    "Location": "(37.76201920035647, -122.42730642251331)"
  }
    

### Response

    {
    "locationid": 1571953,
    "Applicant": "The Geez Freeze",
    "FacilityType": "Truck",
    "cnn": 887000,
    "LocationDescription": "18TH ST: DOLORES ST to CHURCH ST (3700 - 3799)",
    "Address": "3750 18TH ST",
    "blocklot": 3579006,
    "block": 3579,
    "lot": "006",
    "permit": "21MFF-00015",
    "Status": "APPROVED",
    "FoodItems": "Snow Cones: Soft Serve Ice Cream & Frozen Virgin Daiquiris",
    "X": 6004575.869,
    "Y": 2105666.974,
    "Latitude": 37.76201920035647,
    "Longitude": -122.42730642251331,
    "Schedule": "http://bsm.sfdpw.org/PermitsTracker/reports/report.aspx?title=schedule&report=rptSchedule&params=permit=21MFF-00015&ExportPDF=1&Filename=21MFF-00015_schedule.pdf",
    "NOISent": "",
    "Approved": "01/28/2022 12:00:00 AM",
    "Received": 20210315,
    "PriorPermit": 0,
    "ExpirationDate": "11/15/2022 12:00:00 AM",
    "Location": "(37.76201920035647, -122.42730642251331)"
  }
 
  ## Files
     index.js -- Main file  with api logic
     loadder.js--  Business logic and data behind the api '
     csvjson.json-- All the food truck data  is converted to json objects and strored here
     block.js --Logic for the block class
  
  ## MODULES AND PACAKAGES
     The api is built primarily using the Express web framework
     Geo hashing is done using the ngeohash 
     both modules can be found on the npm site
  ## HOW TO RUN
     
     Clone git reposirtory to a folder 
     
      run npm install in directory that contains package.json
     
     run node index.js 
     
     Try out above commands in browser window
     
