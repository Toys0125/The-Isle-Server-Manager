# Isle Server Manager Backend server
Read instructions below to run and setup
## Starting the server
```
#To start run using npm
npm install && npm run start
Make sure you configured .env
```
## Config .env
.env
```
PORT=3001
SteamAPIKEY=xxxxxxxxxxx # https://steamcommunity.com/dev/apikey
FrontEndHostName="localhost"
```
# DataBase
Add these into .env for database usage
```
DatabaseHost=""
DatabaseUser=""
DatabasePassword=""
Database_Database=""
```
Add This to the end if you using database MySQL management NOT IMPLELEMENTED
```
DatabaseMode=10
```
Add This to the end if you using database Postgres management NOT IMPLELMENTED
```
DatabaseMode=20
```

## Config of json
Must be in json format
```
{
    "_comment":"Path to save data if using file system based make sure not to start with /",
    "Path":"../../TheIsle/Saved/Databases/Survival/Players"
}
```
## EndPoints
# /steam
```
// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0001.29
Get('/'){
    Send:{}
    Returns:{[{
		steamName: <string>,
		steamid: <int>
	}]}
}
Get('/id/:steamid'){
    Send:{}
    Returns:{
    "CharacterClass": <string>,
	"DNA": <string>,
	"Location_Isle_V3": "X=<float> Y=<float> Z=<float>",
	//"Rotation_Isle_V3": "P=0.000000 Y=54.962078 R=0.000000",
	"Growth": <float>,
	"Hunger": <string>,
	"Thirst": <string>,
	"Stamina": <string>,
	"Health": <sting>,
	"BleedingRate": <string>,
	"Oxygen": <sting>,
	"bGender": <bool>,
	"bIsResting": <bool>,
	"bBrokenLegs": <bool>,
	"ProgressionPoints": <string>,
	"ProgressionTier": <string,
	"UnlockedCharacters": <string;>,
	//"CameraRotation_Isle_V3": "P=0.000000 Y=144.962143 R=0.000000",
	//"CameraDistance_Isle_V3": "800.012207",
	"SkinPaletteSection1": <int>,
	"SkinPaletteSection2": <int>,
	"SkinPaletteSection3": <int>,
	"SkinPaletteSection4": <int>,
	"SkinPaletteSection5": <int>,
	"SkinPaletteSection6": <int>,
	"SkinPaletteVariation": <string>
    }
}
Put('/id/:steamid'){
    Send:{
    "CharacterClass": <string>,
	"DNA": <string>,
	"Location_Isle_V3": "X=<float> Y=<float> Z=<float>",
	//"Rotation_Isle_V3": "P=0.000000 Y=54.962078 R=0.000000",
	"Growth": <float>,
	"Hunger": <string>,
	"Thirst": <string>,
	"Stamina": <string>,
	"Health": <sting>,
	"BleedingRate": <string>,
	"Oxygen": <sting>,
	"bGender": <bool>,
	"bIsResting": <bool>,
	"bBrokenLegs": <bool>,
	"ProgressionPoints": <string>,
	"ProgressionTier": <string,
	"UnlockedCharacters": <string;>,
	//"CameraRotation_Isle_V3": "P=0.000000 Y=144.962143 R=0.000000",
	//"CameraDistance_Isle_V3": "800.012207",
	"SkinPaletteSection1": <int>,
	"SkinPaletteSection2": <int>,
	"SkinPaletteSection3": <int>,
	"SkinPaletteSection4": <int>,
	"SkinPaletteSection5": <int>,
	"SkinPaletteSection6": <int>,
	"SkinPaletteVariation": <string>
    }
    Returns:{}
}
```
# /login
```
Post('/'){
    Send:{
        username: <string>,
        password: <string>
    }
    Returns:{}
}
Put('/user'){
    Send:{
        id: <int>
        username: ?<string>,
        password: ?<string>, //This is unhashed
        scope: ?[<string>]
    }
    Returns:{}
}
Post('/user'){
    Send:{
        username: <string>,
        password: <string>,
        scope: [<string>]
    }
    Returns:{}
}
Post('/verfiy'){
    Send:{
        username: <string>,
        time: <string>,
        hash: <hex>
    }
    Returns:{}
    Expired:{
        status: "delete"
    }
}
```