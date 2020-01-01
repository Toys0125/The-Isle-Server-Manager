<template>
  <dir>
    <h2 class="text-center">Login</h2>
    <hr />
    <p show v-if="$auth.$state.redirect">You have to login before accessing the Grants Database!</p>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row>
        <v-text-field v-model="username" counter="20" label="Username" :rules="usernameRules"></v-text-field>
      </v-row>
      <v-row>
        <v-text-field
          v-model="password"
          label="Password"
          counter="64"
          :rules="passwordRules"
          type="password"
          @keyup.enter="proccessing == 0? login():None"
        ></v-text-field>
      </v-row>
      <v-row>
        <v-btn @click="login()" color="info" :disabled="proccessing == 1 ? true : false">Login</v-btn>s
      </v-row>
    </v-form>
  </dir>
</template>

<script>
import axios from "@nuxtjs/axios";
import Cookie from "cookie-universal";
const cookies = Cookie();
export default {
  auth: false,
  data() {
    return {
      username: "",
      password: "",
      proccessing: false,
      usernameRules: [
        v => !!v || "UserName is required",
        v => (v && v.length <= 20) || "UserName must be less than 20 characters"
      ],
      passwordRules: [
        v => !!v || "Password is required",
        v => (v && v.length <= 64) || "Password must be less than 64 characters"
      ],
      valid: false
    };
  },
  methods: {
    async login() {
      proccessing = true;
      if (this.valid) {
        var self = this;
        var values = {
          username: this.username,
          password: this.password
        };
        await axios
          .post(backendURL + "/user", values)
          .then(function(response) {
            self.$auth.setUser(self.username);
            cookies.set("auth", false);
            self.$auth.$storage.setUniversal("auth", {
              username: self.username,
              token: response.data.token
            });
            self.$auth.$storage.setUniversal("scope", response.data.scope);
            if (self.$auth.$state.redirect) {
              self.$router.push(self.$auth.$state.redirect);
            } else self.$router.push("/");
            self.proccessing = false; //Give the user the ability to use the button
          })
          .catch(function(error) {
            if (error.response) {
              if ((error.response.status = 401)) {
                console.log(error.response.data);
                self.error = error.response.data;
                setTimeout(5000);
                self.proccessing = false;
              }
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
              self.error = "Network error request was made to the server.";
              setTimeout(5000);
              self.proccessing = false;
            } else {
              console.log(error);
              self.error = "Network error to the server.";
              setTimeout(5000);
              self.proccessing = false;
            }
          });
      }
      setTimeout(5000);
      this.proccessing = false;
    }
  }
};
</script>

<style>
</style>