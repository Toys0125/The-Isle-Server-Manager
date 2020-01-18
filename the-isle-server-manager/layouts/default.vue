<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <dir v-if="isUserLoggedIn()">
          <v-list-item to="/edit">
            <v-list-item-action>
              <v-icon>mdi-fountain-pen-tip</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <dir v-if="isAdmin">
            <v-list-item to="/user">
              <v-list-item-action>
                <v-icon>mdi-login-variant</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Users</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </dir>
          <v-list-item @click="logout">
            <v-list-item-action>
              <v-icon>mdi-exit-to-app</v-icon>
            </v-list-item-action>
            <v-list-item-content>Logout</v-list-item-content>
          </v-list-item>
        </dir>
        <dir v-else>
          <v-list-item to="/login">
            <v-list-item-action>
              <v-icon>mdi-login-variant</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Login</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </dir>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <!-- <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon>mdi-{{ `chevron-${miniVariant ? "right" : "left"}` }}</v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn> -->
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <!-- <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn> -->
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-snackbar
      v-model="snackBar"
      :color="snackBarColor"
      :ulti-line="mode === 'multi-line'"
      :timeout="snackBarTimeout"
      :vertical="mode === 'vertical'"
      >{{ snackBarText }}</v-snackbar
    >
    <v-footer :fixed="fixed" app>
      <span>&copy; 2019 by Toys0125 (CC-BY-NC-SA-4.0)</span>
    </v-footer>
  </v-app>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "The Isle Server Manager",
      logedIn: false,
      snackBarText: "Success!",
      snackBar: false,
      snackBarColor: "green",
      snackBarTimeout: 2000,
      defaultSnackBarTimeout: 2000,
      defaultSuccessSnackBarText: "Success!",
      defaultSuccessSnackBarColor: "green",
      mode: ""
    };
  },
  created() {
    global.backendURL = process.env.BackendURL + process.env.BackendPORT;
    var loginkey = {};
    if (this.$auth.$storage.getUniversal("auth")) {
      var loginkey = this.$auth.$storage.getUniversal("auth");
    }
    if (!this.isEmpty(loginkey) && !this.isUserLoggedIn()) {
      console.log("Checking token.");
      var self = this;
      console.log(loginkey)
      const values = {
        hash: loginkey.hash,
        username: loginkey.username
      };
      console.log(values);
      axios
        .post(
          process.env.BackendURL + process.env.BackendPORT + "/login/verify",
          values
        )
        .then(function(response) {
          console.log("Responsed with", response);
          if (response.data.status != "delete") {
            console.log("Username is", loginkey.username);
            self.$auth.setUser(loginkey.username);
            self.$auth.$storage.setUniversal("scope", response.data.scope)
          } else {
            self.$auth.$storage.setUniversal("auth", null);
          }
          //Hack around auth-module redirect before I could set it.
          if (self.$auth.$state.redirect) {
            self.$router.push(self.$auth.$state.redirect);
          } else self.$router.push("/");
        })
        .catch(function(error) {
          console.error("Error login with token ", error);
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
        });
    }
  },
  mounted() {
    this.$root.$on("showSnackbar", snackbarOptions => {
      this.snackBarColor =
        snackbarOptions.color === ""
          ? this.defaultSuccessSnackBarColor
          : snackbarOptions.color;
      this.snackBarText =
        snackbarOptions.text === ""
          ? this.defaultSuccessSnackBarText
          : snackbarOptions.text;
      this.snackBarTimeout = parseInt(
        snackbarOptions.timeout === "" || snackbarOptions.timeout === 0
          ? this.defaultSnackBarTimeout
          : snackbarOptions.timeout
      );
      this.snackBar = true;
    });
    if (!backendURL) {
        global.backendURL = process.env.BackendURL + process.env.BackendPORT;
    }
  },
  methods: {
    isUserLoggedIn() {
      //console.log("Is the user logged in",this.$auth.loggedIn)
      return this.$auth.loggedIn;
    },
    async logout() {
      const self = this;
      await axios.post(
        backendURL + "/login/logout",
        {
          username: self.$auth.user
        }
      ).catch(function(error) {
        if (error.response.status != 404){
        console.error("Error updating provider " + error);
        this.$nuxt.$emit("showSnackbar", {
          color: "error",
          text: "Error! Look at console log for more.",
          timeout: 3000
        });
        }
      });
      this.$auth.logout();
      this.$auth.$storage.setUniversal("auth", null);
    },
    isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    },
    isAdmin() {
      console.log(this.$auth.$storage.getUniversal("scope"))
      if (this.isUserLoggedIn() && this.$auth.$storage.getUniversal("scope").includes("Management")) {
        return true;
      } else false;
    }
  }
};
</script>
