<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card elevation="12" rounded>

          <v-card-title>Your Review</v-card-title>
          <v-form v-model="formValid" :disabled="disableForm">
            <v-card-text>

              <v-row v-if="disableForm" justify="center">
                <v-col cols="2">
                  <v-btn rounded @click="newReview">
                    <v-icon left>mdi-refresh</v-icon>
                    <span>Submit Another Review</span></v-btn>
                </v-col>
              </v-row>

              <v-row justify="center">
                <v-col cols="12" md="10">
                  <v-textarea v-model="review" :rules="textValidation" auto-grow variant="outlined"/>
                </v-col>
              </v-row>


              <v-row justify="center" class="ma-0 pa-0">
                <v-col cols="12" class="text-center ma-0 pa-0">
                  <span
                    class="text-sm-subtitle-1 font-weight-bold">Please rate the service on a scale from 1 to 5:</span>
                </v-col>

                <v-col cols="12" class="text-center">
                  <v-rating
                    v-model="starsNo"
                    empty-icon="mdi-star-outline"
                    full-icon="mdi-star"
                    half-icon="mdi-star-half"
                    half-increments
                    color="review_star"
                    size="x-large"
                    :item-labels="['Very Dissatisfied', '', '', '', 'Very Satisfied']"
                    item-label-position="bottom"
                    hover
                    :disabled="disableForm"
                  ></v-rating>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-row justify="end">
                <v-btn class="ma-5" size="large" :disabled="!formValid || starsNo === 0 || disableForm" rounded ripple
                       @click="sendRequest"
                       :loading="isLoading">
                  Analyze
                  <v-icon size="small" end icon="mdi-send"/>
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-form>
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
      <v-col v-if="loaded && !isLoading" cols="2">
        <v-card elevation="10">
          <v-card-title class="text-center text-h5">
            Our Prediction:
          </v-card-title>
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
        </v-card>
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
const MODEL_URL = 'http://192.168.1.139:5000/'

// form validation
var formValid = ref<boolean>(false);
const textValidation = [(value) => value.length < 10 ? 'Your review should have at least 10 characters.' : true]
var disableForm = ref<boolean>(false);

// stars review
var starsNo = ref<number>(0);

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

const newReview = async () => {
  review.value = ""
  result.value = false
  loaded.value = false
  starsNo.value = 0
  disableForm.value = false
}

const newRequestMetric = async () => {
  try {
    await axios.post(METRICS_URL + 'total-req');
  } catch (err) {
    console.log("Total Request Metric Push Unsuccessful");
    console.log(err)
  }
}

//initial metric, every time the app opens
newRequestMetric()

const pushCorrectnessMetrics = async (rating, prediction) => {
  try {
    await axios.post(METRICS_URL + 'reviews', {user_predict: rating, predicted: prediction});
  } catch (err) {
    console.log("Reviews Metrics Push Unsuccessful");
    console.log(err)
  }
}



const sendRequest = async () => {
  isLoading.value = true;
  try {
    // track performance
    const start = performance.now();

    const response = await axios.post(MODEL_URL, {"msg": review.value});
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

    // push model accuracy with user input metrics
    pushCorrectnessMetrics(starsNo.value, prediction)

    // disable form until reset
    disableForm.value = true

  } catch (error) {
    isLoading.value = false;
    console.error(error);
  }
};


</script>
