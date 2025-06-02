<template>
  <div
    class="container d-flex justify-content-center align-items-center vh-100"
  >
    <div
      class="card shadow p-4"
      id="card"
      style="min-width: 300px; max-width: 400px; width: 100%"
    >
      <h3 class="mb-4 text-center">Login</h3>

      <div
        v-if="error"
        class="alert alert-danger alert-dismissible fade show mt-3"
        role="alert"
      >
        {{ error }}
        <button
          type="button"
          class="btn-close"
          @click="error = ''"
          aria-label="Fechar"
        ></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Senha</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="form-control"
            required
          />
        </div>

        <button type="submit" class="btn btn-danger w-100">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { token } from "../store/auth.js";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

const handleSubmit = async () => {
  error.value = "";

  try {
    const data = await loginRequest(email.value, password.value);
    localStorage.setItem("token", data.authorization.token);
    token.value = data.authorization.token; // CORRETO
    router.push("/dashboard");
  } catch (err) {
    error.value = err.message;
  }
};

async function loginRequest(email, password) {
  const response = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro no login.");
  }

  return await response.json();
}
</script>

<style scoped>
input:focus {
  box-shadow: none;
  border-color: #dc3545;
}
#card {
  border-top: 3px solid #dc3545;
}
</style>
