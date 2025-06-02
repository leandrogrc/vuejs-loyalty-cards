<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12 col-md-8 offset-md-2">
        <div class="card shadow-sm">
          <div class="card-header bg-danger text-white">
            <h4 class="mb-0">Dashboard do Usuário</h4>
          </div>

          <div class="card-body" v-if="user">
            <p><strong>Nome:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>

            <hr />
            <h5 class="mt-4">Estabelecimentos</h5>

            <ul class="list-group mt-2" v-if="establishments.length">
              <li
                class="list-group-item d-flex justify-content-between align-items-center"
                v-for="est in establishments"
                :key="est.id"
              >
                <router-link
                  :to="`/establishments/${est.id}`"
                  class="text-decoration-none"
                >
                  {{
                    est.establishment_name.length > 25
                      ? est.establishment_name.slice(0, 25) + "..."
                      : est.establishment_name
                  }}
                </router-link>
                <div>
                  <button
                    class="btn btn-sm btn-outline-secondary me-2"
                    @click="openEditModal(est)"
                  >
                    Editar Nome
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(est)"
                  >
                    Deletar
                  </button>
                </div>
              </li>
            </ul>

            <p v-else class="text-muted">Nenhum estabelecimento cadastrado.</p>

            <hr />

            <!-- Botão para abrir modal de criação -->
            <div class="mt-4">
              <button class="btn btn-danger" @click="openCreateModal">
                Criar novo estabelecimento
              </button>
              <p v-if="createError" class="text-danger mt-2">
                {{ createError }}
              </p>
            </div>
          </div>

          <div class="card-body text-center" v-else>
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-3">Carregando informações...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div
      class="modal fade"
      id="modal"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="modalLabel">
              {{ editingEstablishment ? "Editar" : "Criar" }} Estabelecimento
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Fechar"
            ></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              v-model="newEstablishment"
              class="form-control"
              placeholder="Nome do estabelecimento"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button class="btn btn-danger" @click="submitEstablishment">
              {{ editingEstablishment ? "Salvar" : "Criar" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Deletar -->
    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
      ref="deleteModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteModalLabel">Confirmar Deleção</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Fechar"
            ></button>
          </div>
          <div class="modal-body">
            Tem certeza que deseja excluir
            <strong>{{ deleteTarget?.establishment_name }}</strong
            >?
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button class="btn btn-danger" @click="deleteEstablishment">
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { token } from "../store/auth.js";

const router = useRouter();
const user = ref(null);
const establishments = ref([]);
const newEstablishment = ref("");
const createError = ref("");
const editingEstablishment = ref(null);
const deleteTarget = ref(null);

const modalRef = ref(null);
const deleteModalRef = ref(null);

let modalInstance = null;
let deleteModalInstance = null;

onMounted(async () => {
  if (!token.value) return router.push("/login");

  try {
    const userResponse = await fetch("http://localhost:8000/api/auth/me", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (!userResponse.ok) throw new Error("Erro ao buscar usuário");
    user.value = await userResponse.json();

    await fetchEstablishments();

    const bootstrap = await import("bootstrap");
    modalInstance = new bootstrap.Modal(modalRef.value);
    deleteModalInstance = new bootstrap.Modal(deleteModalRef.value);
  } catch (err) {
    console.error(err);
    router.push("/login");
  }
});

const fetchEstablishments = async () => {
  const estResponse = await fetch(
    "http://localhost:8000/api/establishments/by-user",
    {
      headers: { Authorization: `Bearer ${token.value}` },
    }
  );

  if (!estResponse.ok) return;
  establishments.value = await estResponse.json();
};

const openCreateModal = () => {
  editingEstablishment.value = null;
  newEstablishment.value = "";
  createError.value = "";
  modalInstance.show();
};

const openEditModal = (est) => {
  editingEstablishment.value = est;
  newEstablishment.value = est.establishment_name;
  createError.value = "";
  modalInstance.show();
};

const submitEstablishment = async () => {
  createError.value = "";

  if (!newEstablishment.value.trim()) {
    createError.value = "O nome é obrigatório.";
    return;
  }

  try {
    const url = editingEstablishment.value
      ? `http://localhost:8000/api/establishments/${editingEstablishment.value.id}/update`
      : "http://localhost:8000/api/establishments/create";

    const method = editingEstablishment.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ establishment_name: newEstablishment.value }),
    });

    if (!response.ok) throw new Error("Erro ao salvar");

    newEstablishment.value = "";
    editingEstablishment.value = null;
    modalInstance.hide();
    await fetchEstablishments();
  } catch (err) {
    createError.value = err.message;
  }
};

const confirmDelete = (est) => {
  deleteTarget.value = est;
  deleteModalInstance.show();
};

const deleteEstablishment = async () => {
  if (!deleteTarget.value) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/establishments/${deleteTarget.value.id}/delete`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    if (!response.ok) throw new Error("Erro ao deletar");

    deleteModalInstance.hide();
    await fetchEstablishments();
  } catch (err) {
    alert("Erro: " + err.message);
  }
};
</script>

<style scoped>
.card {
  border-top: 4px solid #dc3545;
}
</style>
