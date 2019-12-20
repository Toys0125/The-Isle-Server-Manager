# Isle Server Manager Backend server
Read instructions below to run and setup
## Starting the server
```
#To start run using npm
npm install && npm run start
```
## Config .env
.env
```
PORT=3001
SteamAPIKEY=xxxxxxxxxxx #https://steamcommunity.com/dev/apikey
```
## Config of json
Must be in json format
```
{
    "_comment":"Path to save data if using file system based make sure not to start with /",
    "Path":"../../TheIsle/Saved/Databases/Survival/Players"
}
```
