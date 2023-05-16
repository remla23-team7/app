<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="12" rounded>

          <v-card-title>Your Review</v-card-title>

          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" md="10">
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
      <v-col v-if="loaded && !isLoading" cols="12">
        <template v-if="result">
          <v-col cols="12" class="text-center pa-0 ma-0">
            <v-icon color="success" size="200">mdi-emoticon-happy</v-icon>
          </v-col>
          <v-col cols="12" class="text-center pa-0 ma-0">
            <span class="text-success text-h4 font-weight-bold">POSITIVE</span>
          </v-col>
        </template>
        <template v-else>
          <v-col cols="12" class="text-center pa-0 ma-0">
            <v-icon color="error" size="200">mdi-emoticon-sad</v-icon>
          </v-col>
          <v-col cols="12" class="text-center pa-0 ma-0">
            <span class="text-error text-h4 font-weight-bold">NEGATIVE</span>
          </v-col>
        </template>
      </v-col>
    </v-row>
  </v-container>

</template>


<style scoped>

</style>

<script setup lang="ts">
import {ref} from 'vue';
import axios from 'axios';

const METRICS_URL = 'http://localhost:3001/'
const MODEL_URL = 'http://localhost:5000/'


var loaded = ref<boolean>(false);
var isLoading = ref<boolean>(false);
var review = ref<string>("");
var result = ref<boolean>(false);

const pushResponseTimeMetrics = async (duration) => {
  try {
    await axios.post(METRICS_URL + 'review-average-processing/' + duration);
  } catch (err) {
    console.log("Response Time Metrics Push Unsuccessful");
    console.log(err)
  }
}

const sendRequest = async () => {
  isLoading.value = true;
  try {
    // track performance
    const start = performance.now();

    const response = await axios.post('http://localhost:5000/', {"msg": review.value});

    const end = performance.now()
    const duration = end - start

    const prediction = response.data.prediction;
    if (prediction === "positive") {
      result.value = true;
    } else {
      result.value = false;
    }
    isLoading.value = false;
    loaded.value = true;

    // push the review time metrics
    pushResponseTimeMetrics(duration)

  } catch (error) {
    isLoading.value = false;
    console.error(error);
  }
};


</script>
