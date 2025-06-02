// src/store/auth.js
import { ref, computed } from "vue";

export const token = ref(localStorage.getItem("token"));
export const isLoggedIn = computed(() => !!token.value);
