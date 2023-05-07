<template>
  <v-app-bar flat>
    <v-app-bar-title>
      RELMA 2023 - Group 7 - Version: {{ version }}
    </v-app-bar-title>
  </v-app-bar>
</template>

<script setup>
import VersionUtil from 'relma23-team7-version-util-lib-trial';
import {ref} from "vue";

const version = ref('');
version.value = VersionUtil.getVersion();

</script>
