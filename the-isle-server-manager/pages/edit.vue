<template>
    <dir>
  <v-text>Designed area for editting dinos</v-text>
    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
    >
        <v-container fluid grid-list-md>
            <v-layout row>
                <v-select
                    v-model="selectedSteam"
                    :items="steamNames"
                    label="SteamName"
                    required
                    prepend-icon="mdi-account"
                    :item-text="item => item.steamname + ' [' + item.steamid + ']'"
                />
            </v-layout>
            <dir v-if="selectedSteam && selectedDino">
                <v-layout row>

                </v-layout>
                <v-layout row>
                    <v-text>Gender</v-text>
                    <v-checkbox
                        v-model=selectedGenderCheck
                        label="{{selectedGdender}}"
                        @change="flipGender"
                    />
                </v-layout>
            </dir>
    </v-form>
    </dir>
</template>

<script>
import axios from "@nuxtjs/axios"
export default {
    data(){
        return {
            valid:false,
            steamNames:[],
            steamIds:[],
            selectedSteam:'',
            selectedDino:'',
            selectedGender:"Male",
            selectedGenderCheck: false,
        }
    },
    mounted(){

    },
    methods: {
        flipGender(){
            if (selectedGenderCheck){
                this.selectedGender="Male"
                this.selectedGenderCheck=false
            }else{
                this.selectedGender="Female"
                this.selectedGenderCheck=true
            }
        }
    }
}
</script>

<style>

</style>