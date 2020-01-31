<template>
  <dir>
    <dir v-if="AdminAccount">
      <v-form ref="form" v-model="valid" lazy-validation>
        <dir v-if="editMode">
          <v-row>
            <v-autocomplete
              v-model="user"
              label="User List"
              :items="users"
              :item-text="i => '(' + i.id + ') ' + i.username"
              return-object
              :rules="[i => !!i || 'Item is required']"
              @change="SetValues(false)"
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
        <dir v-if="MasterAccount">
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
          <v-flex m2>
            <v-btn
              @click="editMode ? Update() : Register()"
              color="info"
              :disabled="proccessing == 1 ? true : false"
              >{{ editMode ? "Update" : "Register" }}</v-btn
            >
          </v-flex>
          <v-flex v-if="MasterAccount && editMode">
            <v-btn
              @click="deleteDialog = !deleteDialog"
              color="error"
              :disabled="proccessing == 1 ? true : false"
              >Delete</v-btn
            >
          </v-flex>
          <v-flex m2>
            <v-btn
              @click="ToggleModes"
              color="info"
              :disabled="proccessing == 1 ? true : false"
              >Toggle Modes</v-btn
            >
          </v-flex>
          <v-dialog v-model="deleteDialog" width="500">
            <v-card>
              <v-card-title class="headline lighten-2" primary-title
                >Confirm Submission</v-card-title
              >

              <v-card-text
                >You about to delete a user from the database this can not be
                undone</v-card-text
              >

              <v-checkbox
                color="white"
                v-model="checkbox"
                :rules="[v => !!v || 'You must agree to continue!']"
                label="Do you agree?"
                required
              ></v-checkbox>

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  flat
                  :disabled="!checkbox"
                  @click="Delete"
                  >I accept</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
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
      user: {},
      users: [],
      username: "",
      password: "",
      scopeList: ["User", "Admin"],
      scope: [],
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
      AdminAccount: false,
      proccessing: false,
      deleteDialog: false,
      checkbox: false
    };
  },
  created() {
    this.editMode = this.propEditMode != false ? true : false;
    console.log(this.$auth.$storage.getUniversal("scope"));
    if (
      this.$auth.$storage.getUniversal("scope").includes("Admin") ||
      this.$auth.$storage.getUniversal("scope").includes("Master")
    ) {
      this.AdminAccount = true;
    } else {
      this.$nuxt.$emit("showSnackbar", {
        color: "error",
        text: "Not part of the Management Permissions",
        timeout: 3000
      });
      setTimeout(3000);
      this.$router.push("/");
    }
    if (this.MasterAccount()){
      this.scopeList.push("Master")
    }
  },
  methods: {
    Update() {
      this.proccessing = true;
      var values = this.user;
      values.username =
        this.username == this.user.username
          ? this.user.username
          : this.username;
      values.password = this.password ? this.password : "";
      values.scope =
        this.scope == this.user.scope ? this.user.scope : this.scope;
      var self = this;
      let loginDetails = this.$auth.$storage.getUniversal("auth", true)
      let data = {
        username: loginDetails.username,
        hash: loginDetails.hash,
        userdata: values
      }
      if (this.valid) {
        axios
          .put(backendURL + "/login/user", data)
          .then(function(response) {
            self.$nuxt.$emit("showSnackbar", {
              color: "success",
              text: "Updated User",
              timeout: 3000
            });
            setTimeout(3000);
            self.proccessing = false;
          })
          .catch(function(error) {
            console.error("Updating user", error);
            self.$nuxt.$emit("showSnackbar", {
              color: "error",
              text: "Error! Look at console log for more.",
              timeout: 3000
            });
            setTimeout(3000);
            self.proccessing = false;
          });
      }
      this.proccessing = false;
    },
    Register() {
      this.proccessing = true;
      var values = {
        username: this.username,
        password: this.password,
        scope: this.scope
      };
      var self = this;
      let loginDetails = this.$auth.$storage.getUniversal("auth", true)
      let data = {
        username: loginDetails.username,
        hash: loginDetails.hash,
        userdata: values
      }
      if (this.valid) {
        axios
          .post(backendURL + "/login/user", data)
          .then(function(response) {
            self.$nuxt.$emit("showSnackbar", {
              color: "success",
              text: "Registered User",
              timeout: 3000
            });
            setTimeout(3000);
            self.proccessing = false;
          })
          .catch(function(error) {
            var bool = true;
            if (error.response.status == 403) {
              if (error.response.body == "Username Already Taken") {
                bool = false;
                self.$nuxt.$emit("showSnackbar", {
                  color: "error",
                  text: "Error! Look at console log for more.",
                  timeout: 3000
                });
              }
            }
            if (bool) {
              console.error("Registering user", error);
              self.$nuxt.$emit("showSnackbar", {
                color: "error",
                text: "Error! Look at console log for more.",
                timeout: 3000
              });
            }

            setTimeout(3000);
            self.proccessing = false;
          });
      }
      this.proccessing = false;
    },
    Delete() {
      this.proccessing = true;
      this.deleteDialog = false;
      var auth = this.$auth.$storage.getUniversal("auth");
      var values = {
        id: this.id,
        username: auth.username,
        hash: auth.hash
      };
      var self = this;
      axios
        .delete(backendURL + "/login", values)
        .then(function(response) {
          self.$nuxt.$emit("showSnackbar", {
            color: "success",
            text: "Deleted User",
            timeout: 6000
          });
          setTimeout(3000);
          self.proccessing = false;
        })
        .catch(function(error) {
          console.error("Deleting user", error);
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
          setTimeout(3000);
          self.proccessing = false;
        });
    },
    SetValues(empty) {
      if (!empty) {
        this.username = this.user.username;
        this.scope = this.user.scope;
      } else {
        console.log("emptying");
        this.user = null;
        this.username = null;
        this.scope = null;
      }
    },
    MasterAccount() {
      if (this.$auth.$storage.getUniversal("scope").includes("Master")) {
        return true;
      } else return false;
    },
    ToggleModes() {
      this.editMode = !this.editMode;
      if (this.editMode) {
        this.GetUsers();
      } else {
        this.SetValues(true);
      }
    },
    GetUsers() {
      this.proccessing = true;
      var self = this;
      axios
        .get(backendURL + "/login")
        .then(function(response) {
          self.users = response.data;
          self.proccessing = false;
        })
        .catch(function(error) {
          console.error("Get Users", error);
          self.$nuxt.$emit("showSnackbar", {
            color: "error",
            text: "Error! Look at console log for more.",
            timeout: 3000
          });
          setTimeout(3000);
          self.proccessing = false;
        });
      this.proccessing = false;
    }
  }
};
</script>

<style></style>
