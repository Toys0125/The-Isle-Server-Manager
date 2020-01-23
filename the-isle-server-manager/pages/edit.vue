<template>
  <dir>
    <v-subheader>Edit Users Dinos</v-subheader>
    <!-- <p>Designed area for editting dinos</p> -->
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-container fluid grid-list-md>
        <v-row v-if="accesstime">
          <p>{{ timeDiffernce() }}</p>
        </v-row>
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
            <v-autocomplete
              v-model="selectedDino"
              :items="dinoItems"
              :item-text="item => item.Dinoname"
              :item-value="item => item.DinoID"
              label="Dino"
              prepend-icon="mdi-cloud"
              @change="setMaxValues"
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
          <v-row align="center" justity="center">
            <v-col md3>
              <v-text-field v-model="xCords" label="X Cords" />
            </v-col>
            <v-col md3>
              <v-text-field v-model="yCords" label="Y Cords" />
            </v-col>
            <v-col md3>
              <v-text-field v-model="zCords" label="Z Cords" />
            </v-col>
            <v-flex md1>
              TextField
            </v-flex>
            <v-flex md2>
              <v-checkbox
                v-model="restingobj.check"
                :label="restingobj.text"
                prepend-icon="mdi-hotel"
                @change="flipCheck(['Resting', 'Standing'], restingobj)"
              />
            </v-flex>
            <v-flex md2 align-self-center>
              <v-checkbox
                v-model="brokenlegobj.check"
                :label="brokenlegobj.text"
                prepend-icon="mdi-bone"
                @change="flipCheck(['Broken', 'Not Broken'], brokenlegobj)"
              />
            </v-flex>
          </v-row>
          <!-- <v-row align="center" justify="center">
            <v-flex md5>
              <v-checkbox
                v-model="restingobj.check"
                :label="restingobj.text"
                prepend-icon="mdi-hotel"
                @change="flipCheck(['Resting', 'Standing'], restingobj)"
              />
            </v-flex>
            <v-flex md5 align-self-center>
              <v-checkbox
                v-model="brokenlegobj.check"
                :label="brokenlegobj.text"
                prepend-icon="mdi-bone"
                @change="flipCheck(['Broken', 'Not Broken'], brokenlegobj)"
              />
            </v-flex>
          </v-row> -->
          <v-row justify="center">
            <v-flex md2>
              <v-btn color="info" @click="setValues">Reset</v-btn>
            </v-flex>
            <v-flex md3>
              <v-btn color="blue" @click="setMaxValues">Max Values</v-btn>
            </v-flex>
            <v-flex md2>
              <v-btn color="error" @click="reset">Clear</v-btn>
            </v-flex>
            <v-flex md2>
              <v-btn
                color="info"
                @click="submitValues"
                :disabled="proccessing == 1 && valid != true ? true : false"
                >Submit</v-btn
              >
            </v-flex>
          </v-row>
        </dir>
      </v-container>
    </v-form>
  </dir>
</template>

<script>
import axios from "axios";
export default {
  middleware: "auth",
  data() {
    return {
      valid: false,
      steamNames: [],
      dinoItems: [
        { Dinoname: "Anky Sandbox", DinoID: "Anky" },
        { Dinoname: "AnkyJuv Sandbox", DinoID: "AnkyJuv" },
        { Dinoname: "Austro Sandbox", DinoID: "Austro" },
        { Dinoname: "AustroJuv Sandbox", DinoID: "AustroJuv" },
        { Dinoname: "Ava Sandbox", DinoID: "Ava" },
        { Dinoname: "AvaJuv Sandbox", DinoID: "AvaJuv" },
        { Dinoname: "Camara Sandbox", DinoID: "Camara" },
        { Dinoname: "Oro Sandbox", DinoID: "Oro" },
        { Dinoname: "Taco Sandbox", DinoID: "Taco" },
        { Dinoname: "Puerta Sandbox", DinoID: "Puerta" },
        { Dinoname: "Shant Sandbox", DinoID: "Shant" },
        { Dinoname: "ShantJuv Sandbox", DinoID: "ShantJuv" },
        { Dinoname: "Stego Sandbox", DinoID: "Stego" },
        { Dinoname: "Theri Sandbox", DinoID: "Theri" },
        { Dinoname: "TheriJuv Sandbox", DinoID: "TheriJuv" },
        { Dinoname: "Acro Sandbox", DinoID: "Acro" },
        { Dinoname: "Albert Sandbox", DinoID: "Albert" },
        { Dinoname: "Bary Sandbox", DinoID: "Bary" },
        { Dinoname: "BaryJuv Sandbox", DinoID: "BaryJuv" },
        { Dinoname: "Herrera Sandbox", DinoID: "Herrera" },
        { Dinoname: "HerreraJuv Sandbox", DinoID: "HerreraJuv" },
        { Dinoname: "Spino Sandbox", DinoID: "Spino" },
        { Dinoname: "SpinoJuv Sandbox", DinoID: "SpinoJuv" },
        { Dinoname: "Velo Sandbox", DinoID: "Velo" },
        { Dinoname: "DiabloAdult Survival", DinoID: "DiabloAdultS" },
        { Dinoname: "DiabloJuv Survival", DinoID: "DiabloJuvS" },
        { Dinoname: "DiabloHatch Survival", DinoID: "DiabloHatchS" },
        { Dinoname: "DryoAdult Survival", DinoID: "DryoAdultS" },
        { Dinoname: "DryoJuv Survival", DinoID: "DryoJuvS" },
        { Dinoname: "DryoHatch Survival", DinoID: "DryoHatchS" },
        { Dinoname: "GalliAdult Survival", DinoID: "GalliAdultS" },
        { Dinoname: "GalliJuv Survival", DinoID: "GalliJuvS" },
        { Dinoname: "GalliHatch Survival", DinoID: "GalliHatchS" },
        { Dinoname: "MaiaAdult Survival", DinoID: "MaiaAdultS" },
        { Dinoname: "MaiaJuv Survival", DinoID: "MaiaJuvS" },
        { Dinoname: "MaiaHatch Survival", DinoID: "MaiaHatchS" },
        { Dinoname: "PachyAdult Survival", DinoID: "PachyAdultS" },
        { Dinoname: "PachyHatch Survival", DinoID: "PachyHatchS" },
        { Dinoname: "PachyJuv Survival", DinoID: "PachyJuvS" },
        { Dinoname: "ParaAdult Survival", DinoID: "ParaAdultS" },
        { Dinoname: "ParaJuv Survival", DinoID: "ParaJuvS" },
        { Dinoname: "ParaHatch Survival", DinoID: "ParaHatchS" },
        { Dinoname: "TrikeAdult Survival", DinoID: "TrikeAdultS" },
        { Dinoname: "TrikeSub Survival", DinoID: "TrikeSubS" },
        { Dinoname: "TrikeJuv Survival", DinoID: "TrikeJuvS" },
        { Dinoname: "TrikeHatch Survival", DinoID: "TrikeHatchS" },
        { Dinoname: "AlloAdult Survival", DinoID: "AlloAdultS" },
        { Dinoname: "AlloJuv Survival", DinoID: "AlloJuvS" },
        { Dinoname: "AlloHatch Survival", DinoID: "AlloHatchS" },
        { Dinoname: "CarnoAdult Survival", DinoID: "CarnoAdultS" },
        { Dinoname: "CarnoSub Survival", DinoID: "CarnoSubS" },
        { Dinoname: "CarnoJuv Survival", DinoID: "CarnoJuvS" },
        { Dinoname: "CarnoHatch Survival", DinoID: "CarnoHatchS" },
        { Dinoname: "CeratoAdult Survival", DinoID: "CeratoAdultS" },
        { Dinoname: "CeratoJuv Survival", DinoID: "CeratoJuvS" },
        { Dinoname: "CeratoHatch Survival", DinoID: "CeratoHatchS" },
        { Dinoname: "DiloAdult Survival", DinoID: "DiloAdultS" },
        { Dinoname: "DiloJuv Survival", DinoID: "DiloJuvS" },
        { Dinoname: "DiloHatch Survival", DinoID: "DiloHatchS" },
        { Dinoname: "GigaAdult Survival", DinoID: "GigaAdultS" },
        { Dinoname: "GigaSub Survival", DinoID: "GigaSubS" },
        { Dinoname: "GigaJuv Survival", DinoID: "GigaJuvS" },
        { Dinoname: "GigaHatch Survival", DinoID: "GigaHatchS" },
        { Dinoname: "SuchoAdult Survival", DinoID: "SuchoAdult Survival" },
        { Dinoname: "SuchJuv Survival", DinoID: "SuchJuvS" },
        { Dinoname: "SuchoHatch Survival", DinoID: "SuchHatchS" },
        { Dinoname: "RexAdult Survival", DinoID: "RexAdultS" },
        { Dinoname: "RexSub Survival", DinoID: "RexSubS" },
        { Dinoname: "RexJuv Survival", DinoID: "RexJuvS" },
        { Dinoname: "UtahAdult Survival", DinoID: "UtahAdultS" },
        { Dinoname: "UtahJuv Survival", DinoID: "UtahJuvS" },
        { Dinoname: "UtahHatch Survival", DinoID: "UtahHatchS" }
      ],
      selectedSteam: "",
      playerData: null,
      selectedDino: "",
      selectedGender: "Male",
      selectedGenderCheck: false,
      restingobj: { text: "Standing", check: false },
      brokenlegobj: { text: "Not Broken", check: false },
      growth: "",
      xCords: "",
      yCords: "",
      zCords: "",
      health: "",
      valid: false,
      proccessing: false,
      accesstime: ""
    };
  },
  created() {
    this.GatherSteamIds();
  },
  methods: {
    flipGender() {
      if (this.selectedGenderCheck) {
        this.selectedGender = "Female";
      } else {
        this.selectedGender = "Male";
      }
    },
    flipCheck(values, obj) {
      if (obj.check) {
        obj.text = values[0];
      } else {
        obj.text = values[1];
      }
    },
    async GatherSteamIds() {
      var self = this;
      await axios
        .get(backendURL + "/steam/")
        .then(function(response) {
          // console.log(response);
          self.steamNames = response.data;
        })
        .catch(function(err) {
          console.error("GatherSteamIds errored with ", err);
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
        });
    },
    async GatherPlayerdata() {
      this.proccessing = true;
      this.playerData = null;
      var self = this;
      await axios
        .get(backendURL + "/steam/id/" + this.selectedSteam.steamid)
        .then(function(response) {
          self.playerData = response.data;
          self.setValues();
          self.proccessing = false;
        })
        .catch(function(error) {
          console.error("GatherPlayerdata", error);
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
          setTimeout(3000);
          self.proccessing = false;
        });
      this.proccessing = false;
      // console.log(this.playerData.data);
    },
    setValues() {
      this.selectedDino = this.playerData.data.CharacterClass;
      this.selectedGenderCheck = this.playerData.data.bGender;
      this.flipGender();
      this.growth = this.playerData.data.Growth;
      this.health = this.playerData.data.Health;
      if (this.playerData.data.BleedingRate != 0) {
        this.playerData.data.BleedingRate = 0;
      }
      this.restingobj.check = this.playerData.data.bIsResting;
      this.flipCheck(["Resting", "Standing"], this.restingobj);
      this.brokenlegobj.check = this.playerData.data.bBrokenLegs;
      this.flipCheck(["Broken", "Not Broken"], this.brokenlegobj);
      var cords = this.playerData.data.Location_Isle_V3.split(" ");
      this.xCords = cords[0].split("=")[1];
      this.yCords = cords[1].split("=")[1];
      this.zCords = cords[2].split("=")[1];
      this.accesstime = this.playerData.accessTime
        ? new Date(this.playerData.accessTime)
        : "";
    },
    timeDiffernce() {
      let dif = new Date() - this.accesstime;
      if (dif>60){
      dif = Math.round(dif / 1000 / 60);
      let string =
        String(Math.floor(dif / 1440)) +
        " Days " +
        String(Math.floor((dif % 1440) / 60)) +
        " Hours " +
        String(Math.floor((dif % 1440) / 60)) +
        " Mins Last Accessed";
      return string;
      } else{
        let string = "Likely Online " + String(Math.floor(dif))+" secs"
        return string
      }
    },
    setMaxValues() {
      this.growth = "1.0";
      this.health = "999999999";
    },
    async submitValues() {
      var newData = this.playerData.data;
      newData.CharacterClass = this.selectedDino;
      newData.bGender = this.selectedGenderCheck;
      newData.growth = this.growth;
      newData.bIsResting = this.restingobj.check;
      newData.bBrokenLegs = this.brokenlegobj.check;
      newData.Hunger = "9999999";
      newData.Thirst = "9999999";
      newData.Stamina = "99999999";
      newData.health = this.health;
      var cords = this.playerData.data.Location_Isle_V3.split(" ");
      newData.Location_Isle_V3 =
        cords[0].split("=")[0] +
        "=" +
        this.xCords +
        " " +
        cords[1].split("=")[0] +
        "=" +
        this.yCords +
        " " +
        cords[2].split("=")[0] +
        "=" +
        this.zCords;
      this.valid = false;
      await axios
        .put(backendURL + "/steam/id/" + this.selectedSteam.steamid, newData)
        .then(function(response) {
          self.$nuxt.$emit("showSnackbar", {
            color: "Success",
            text: "Player has been updated",
            timeout: 3000
          });
          setTimeout(2000);
          valid = true;
        })
        .catch(function(error) {
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
        });
    },
    reset() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style></style>
