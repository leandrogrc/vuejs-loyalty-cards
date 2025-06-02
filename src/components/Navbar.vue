<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { token, isLoggedIn } from "../store/auth.js";

const router = useRouter();
const route = useRoute();
const isOpen = ref(false);
const navbarRef = ref(null);

const toggleNavbar = () => {
  isOpen.value = !isOpen.value;
};

const closeNavbar = () => {
  isOpen.value = false;
};

const handleLogout = async () => {
  try {
    await fetch("http://localhost:8000/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    localStorage.removeItem("token");
    token.value = null;
    router.push("/login");
  } catch (error) {
    console.error(error);
    alert("Erro ao fazer logout.");
  }
};

// Fecha o menu se clicar fora dele
const handleClickOutside = (event) => {
  if (navbarRef.value && !navbarRef.value.contains(event.target)) {
    closeNavbar();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <nav
    ref="navbarRef"
    class="navbar navbar-expand-lg navbar-dark bg-danger vw-100 sticky"
  >
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bolder" to="/" @click="closeNavbar">
        Meu App
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        @click.stop="toggleNavbar"
        aria-controls="navbarNav"
        :aria-expanded="isOpen.toString()"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div
        :class="['collapse navbar-collapse', { show: isOpen }]"
        id="navbarNav"
      >
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink
              class="btn btn-link nav-link"
              :class="{ active: route.path === '/' }"
              to="/"
              @click="closeNavbar"
            >
              <i class="bi bi-house"></i> Home
            </RouterLink>
          </li>

          <li class="nav-item" v-if="isLoggedIn">
            <RouterLink
              class="btn btn-link nav-link"
              :class="{ active: route.path === '/dashboard' }"
              to="/dashboard"
              @click="closeNavbar"
            >
              <i class="bi bi-person"></i> Dashboard
            </RouterLink>
          </li>

          <li class="nav-item" v-if="isLoggedIn">
            <a
              href="#"
              class="btn btn-link nav-link"
              @click.prevent="
                handleLogout();
                closeNavbar();
              "
            >
              <i class="bi bi-arrow-bar-right"></i> Logout
            </a>
          </li>

          <li class="nav-item" v-if="!isLoggedIn">
            <RouterLink
              class="btn btn-link nav-link"
              :class="{ active: route.path === '/login' }"
              to="/login"
              @click="closeNavbar"
            >
              <i class="bi bi-door-open"></i> Login
            </RouterLink>
          </li>

          <li class="nav-item" v-if="!isLoggedIn">
            <RouterLink
              class="btn btn-link nav-link"
              :class="{ active: route.path === '/register' }"
              to="/register"
              @click="closeNavbar"
            >
              <i class="bi bi-sign-turn-right"></i> Register
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
