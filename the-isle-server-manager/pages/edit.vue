<template>
    <dir>
  <p>Designed area for editting dinos</p>
    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
    >
        <v-container fluid grid-list-md>
            <v-layout row>
                <v-autocomplete
                    v-model="selectedSteam"
                    :items="steamNames"
                    label="SteamName"
                    required
                    return-object
                    prepend-icon="mdi-account"
                    :item-text="item => item.steamName + ' [' + item.steamid + ']'"
                    @change="GatherPlayerdata"
                />
            </v-layout>
            <dir v-if="selectedSteam && playerData">
                <v-layout row>
                    <v-text-field
                        v-model="selectedDino"
                        label="Dino"
                        prepend-icon="mdi-cloud"
                    />
                </v-layout>
                
                <v-layout row>
                    <v-flex>
                    <v-text-field
                        v-model="growth"
                        label="Growth"
                        prepend-icon="mdi-arrow-expand-vertical"
                    />
                    </v-flex>
                    <v-flex>
                        <v-text-field
                            v-model="health"
                            label="Health"
                            prepend-icon="mdi-hospital-box"
                        />
                    </v-flex>
                    <v-checkbox
                            v-model="selectedGenderCheck"
                            :label="selectedGender"
                            @change="flipGender"
                        />
                </v-layout>
                <v-layout row>
                    <v-layout align-center>
                        <v-flex md5>
                            <v-text-field
                                v-model="xCords"
                                label="X Cords"
                            />
                        </v-flex>
                        <v-flex md5>
                            <v-text-field
                                v-model="yCords"
                                label="Y Cords"
                            />
                        </v-flex>
                        <v-flex md5>
                            <v-text-field
                                v-model="zCords"
                                label="Z Cords"
                            />
                        </v-flex>
                        <v-flex md5>
                            TextField
                        </v-flex>
                    </v-layout>
                </v-layout>
                <v-row
                    align="center"
                    justify="center"
                >
                    <v-flex md5 align-self-center>
                        <v-checkbox
                            v-model="restingobj.check"
                            :label="restingobj.text"
                            prepend-icon="mdi-hotel"
                            @change="flipCheck(['Resting','Standing'],restingobj)"
                        />
                        </v-flex>
                    <v-flex md5 align-self-center>
                        <v-checkbox
                            v-model="brokenlegobj.check"
                            :label="brokenlegobj.text"
                            prepend-icon="mdi-bone"
                            @change="flipCheck(['Broken','Not Broken'],brokenlegobj)"
                        />
                    </v-flex>
                </v-row>
                <v-row>
                    <v-btn color="info" @click="submitValues" disable="valid ? '' : disabled">Submit</v-btn>
                </v-row>
            </dir>
        </v-container>
    </v-form>
    </dir>
</template>

<script>
import axios from "axios"
export default {
    data(){
        return {
            valid:false,
            steamNames:[{steamName:"Your Mom",steamid:7618169816}],
            selectedSteam:'',
            playerData:null,
            selectedDino:'',
            selectedGender:"Male",
            selectedGenderCheck: false,
            restingobj:{text:"Standing", check:false},
            brokenlegobj:{text:"Not Broken",check:false},
            growth:"",
            xCords:"",
            yCords:"",
            zCords:"",
            health:"",
            valid:true
        }
    },
    mounted(){
        global.backendURL = process.env.BackendURL + process.env.BackendPORT
        this.GatherSteamIds()
    },
    methods: {
        flipGender(){
            if (this.selectedGenderCheck){
                this.selectedGender="Female"
            }else{
                this.selectedGender="Male"
            }
        },
        flipCheck(values,obj){
            if (obj.check){
                obj.text = values[0]
            }else{
                obj.text = values[1]
            }
        },
        async GatherSteamIds(){
            var self = this
            await axios.get(backendURL+'/steam/').then(function(response){
                console.log (response);
                self.steamNames=response.data
            }).catch(function(err){
                console.error("GatherSteamIds errored with ", err);
            })
        },
        async GatherPlayerdata(){
            var self = this
            await axios.get(backendURL+'/steam/id/'+this.selectedSteam.steamid).then(function(response){
                self.playerData = response.data
                self.setValues()
            })
        },
        setValues(){
            this.selectedDino = this.playerData.CharacterClass
            this.selectedGenderCheck = this.playerData.bGender
            this.flipGender()
            this.growth = this.playerData.Growth
            this.health = this.playerData.health
            if (this.playerData.BleedingRate != 0){
                this.playerData.BleedingRate =0
            }
            this.restingobj.check = this.playerData.bIsResting
            this.flipCheck(['Resting','Standing'],this.restingobj)
            this.brokenlegobj.check = this.playerData.bBrokenLegs
            this.flipCheck(['Broken','Not Broken'],this.brokenlegobj)
            var cords = this.playerData.Location_Isle_V3.split(' ')
            this.xCords = cords[0].split('=')[1]
            this.yCords = cords[1].split('=')[1]
            this.zCords = cords[2].split('=')[1]
        },
        async submitValues(){
            var newData = this.playerData
            newData.CharacterClass = this.selectedDino
            newData.bGender = this.selectedGenderCheck
            newData.growth = this.growth
            newData.bIsResting = this.restingobj.check
            newData.bBrokenLegs = this.brokenlegobj.check
            var cords = this.playerData.Location_Isle_V3.split(' ')
            newData.Location_Isle_V3 = string(cords[0].split('=')[0] + '='+this.xCords + ' ' + cords[1].split('=')[0] + '=' + this.yCords+' '+cords[2].split('=')[0]+'='+this.zCords)
            valid= false;
            await axios.put(backendURL+'/steam/'+this.selectedSteam.steamid,newData).then(function(response){
                setTimeout(2000)
                valid = true
            })
        }
    }
}
</script>

<style>

</style>