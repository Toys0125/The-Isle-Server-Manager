<template>
  <dir>
    <dir v-if="MasterAccount">
      <v-form ref="form" v-model="valid" lazy-validation>
        <dir v-if="editMode">
          <v-row>
            <v-autocomplete 
            v-model="user"
            label="User List"
            :items="users"
            return-object
            :rules="[i => !!v || 'Item is required']"
            />
          </v-row>
        </dir>
        <v-row>
          <v-text-field
            v-model="username"
            counter="20"
            required
            label="Username"
            :rules="usernameRules"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-text-field
            v-model="password"
            label="Password"
            counter="64"
            :rules="passwordRules"
            type="password"
          ></v-text-field>
        </v-row>
        <dir v-if="MasterAccount()">
          <v-row>
            <v-autocomplete
              v-model="scope"
              :items="scopeList"
              label="Scope"
              required
              multiple
            />
          </v-row>
        </dir>
        <v-row>
          <v-btn
            @click="editMode ? Update() : Register()"
            color="info"
            :disabled="proccessing == 1 ? true : false"
            >{{ editMode ? "Update" : "Register" }}</v-btn
          >
          <v-btn @click="!editMode" color="info">Toggle Modes</v-btn>
        </v-row>
      </v-form>
    </dir>
    <dir v-else>
      <p>Not an Management permission</p>
    </dir>
  </dir>
</template>

<script>
import axios from "axios";
export default {
  middleware: "auth",
  props: {
    propEditMode: Boolean
  },
  data() {
    return {
        user={},
        users=[],
        username: "",
        password: "",
        scopeList: ["User", "Admin", "Management"],
        scope: {},
        editMode: false,
        usernameRules: [
        v => !!v || "UserName is required",
        v => (v && v.length <= 20) || "UserName must be less than 20 characters"
        ],
        passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length <= 64) || "Password must be less than 64 characters"
        ],
        valid: true,
        MasterAccount: false
    };
  },
  created() {
    this.editMode = this.propEditMode != false ? true : false;
    if (this.$auth.$storage.getUniversal("scope").includes("Management")) {
      this.MasterAccount = true;
    } else {
      this.$nuxt.$emit("showSnackbar", {
        color: "error",
        text: "Not part of the Management Permissions",
        timeout: 3000
      });
      setTimeout(3000)
      self.$router.push("/")
    }
  },
  methods: {
    Update() {
      var values = {
        username: this.username,
        password: this.password,
        scope: this.scope
      };
      var self = this
      this.axios
        .put(backendURL + "/login/user", values)
        .then(function(response) {
            self.$nuxt.$emit("showSnackbar", {
        color: "success",
        text: "Updated User",
        timeout: 3000
      });
        })
        .catch(function(error) {
          console.error("Updating user", error);
          this.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
        });
    },
    Register() {
        var values = {
        username: this.username,
        password: this.password,
        scope: this.scope
      };
      var self = this
      this.axios
        .put(backendURL + "/login/user", values)
        .then(function(response) {
            self.$nuxt.$emit("showSnackbar", {
        color: "success",
        text: "Updated User",
        timeout: 3000
      });
        })
        .catch(function(error) {
          console.error("Updating user", error);
          this.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
        });
    },
    MasterAccount(){
        if(this.$auth.$storage.getUniversal("scope").includes("Master")){
            return true
        } else return false
    }
  }
};
</script>

<style></style>
