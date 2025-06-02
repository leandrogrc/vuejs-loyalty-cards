<template>
  <div
    class="container d-flex justify-content-center align-items-center vh-100"
  >
    <div
      class="card shadow p-4"
      id="card"
      style="min-width: 300px; max-width: 500px; width: 100%"
    >
      <h3 class="mb-4 text-center">Criar Conta</h3>

      <div
        v-if="error"
        class="alert alert-danger alert-dismissible fade show"
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
          <label for="name" class="form-label">Nome</label>
          <input
            type="text"
            id="name"
            v-model="name"
            class="form-control"
            placeholder="Seu nome completo"
            required
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Senha</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password_confirmation" class="form-label"
            >Confirme a senha</label
          >
          <input
            type="password"
            id="password_confirmation"
            v-model="password_confirmation"
            class="form-control"
            placeholder="Digite sua senha novamente"
            required
          />
        </div>

        <button type="submit" class="btn btn-danger w-100">Registrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const name = ref("");
const email = ref("");
const password = ref("");
const password_confirmation = ref("");
const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  if (password.value !== password_confirmation.value) {
    error.value = "As senhas não coincidem.";
    return;
  }

  try {
    const data = await registerRequest({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });

    // Armazene token e redirecione se necessário
    alert("Conta criada com sucesso!");
    // router.push('/dashboard') se desejar redirecionar
  } catch (err) {
    error.value = err.message;
  }
};

async function registerRequest(payload) {
  const url = "http://localhost:8000/api/users/create";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro no registro.");
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
