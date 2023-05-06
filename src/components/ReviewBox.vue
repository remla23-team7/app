<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="12" rounded>

          <v-card-title>Your Review</v-card-title>

          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" md="8">
                <v-textarea v-model="review" auto-grow variant="outlined"/>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-row justify="end">
              <v-btn class="ma-5" size="large" rounded ripple @click="sendRequest" :loading="isLoading">
                Analyze
                <v-icon size="small" end icon="mdi-send"/>
              </v-btn>
            </v-row>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col v-if="isLoading" cols="12" class="text-center">
        <v-progress-circular
          :size="50"
          color="amber"
          indeterminate
        ></v-progress-circular>
      </v-col>
      <v-col cols="3" v-else>
        <span class="text-h4">{{ result }}</span>
      </v-col>
    </v-row>
  </v-container>

</template>


<style scoped>

</style>

<script setup lang="ts">
import {ref} from 'vue';
import axios from 'axios';


var isLoading = ref<boolean>(false);
var review = ref<string>("");
var result = ref<string>("");

const sendRequest = async () => {
  isLoading.value = true;
  try {
    console.log("text", review.value)
    const response = await axios.post('localhost:8080/', {"msg": review.value});
    result.value = response.data;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.error(error);
  }
};


</script>
