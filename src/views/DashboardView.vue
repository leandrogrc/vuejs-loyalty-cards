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
                class="list-group-item"
                v-for="est in establishments"
                :key="est.id"
              >
                <div class="d-flex flex-column">
                  <router-link
                    :to="`/establishments/${est.id}`"
                    class="text-decoration-none mb-2"
                  >
                    {{
                      est.establishment_name.length > 25
                        ? est.establishment_name.slice(0, 25) + "..."
                        : est.establishment_name
                    }}
                  </router-link>
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      @click="openEditModal(est)"
                    >
                      Editar
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(est)"
                    >
                      Excluir
                    </button>
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="openLoyaltyModal(est)"
                    >
                      + Cartão Fidelidade
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openCreateClientModal(est)"
                    >
                      + Cliente
                    </button>
                  </div>
                </div>
              </li>
            </ul>

            <p v-else class="text-muted">Nenhum estabelecimento cadastrado.</p>

            <hr />

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

    <!-- Modal Cartão Fidelidade -->
    <div
      class="modal fade"
      id="loyaltyModal"
      tabindex="-1"
      aria-labelledby="loyaltyModalLabel"
      aria-hidden="true"
      ref="loyaltyModalRef"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title" id="loyaltyModalLabel">
              Criar Cartão Fidelidade
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Fechar"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Estabelecimento</label>
              <input
                type="text"
                class="form-control"
                :value="selectedEstablishment?.establishment_name"
                disabled
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Selecionar Cliente</label>
              <select v-model="selectedClientId" class="form-select" required>
                <option disabled value="">Selecione um cliente</option>
                <option
                  v-for="client in clients"
                  :key="client.id"
                  :value="client.id"
                >
                  {{ client.name }}
                  {{ client.email ? `(${client.email})` : "" }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Visitas Pagas (inicial)</label>
              <input
                type="number"
                v-model="paidVisits"
                class="form-control"
                min="0"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Total de Visitas Requeridas</label>
              <input
                type="number"
                v-model="totalVisitsRequired"
                class="form-control"
                min="1"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Recompensas para Reivindicar</label>
              <input
                type="number"
                v-model="rewardsToClaim"
                class="form-control"
                min="0"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Recompensas Reivindicadas</label>
              <input
                type="number"
                v-model="rewardsClaimed"
                class="form-control"
                min="0"
                required
              />
            </div>
            <p v-if="loyaltyError" class="text-danger">{{ loyaltyError }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button class="btn btn-success" @click="createLoyaltyCard">
              Criar
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
const loyaltyModalRef = ref(null);

let modalInstance = null;
let deleteModalInstance = null;
let loyaltyModalInstance = null;

const clients = ref([]);
const selectedEstablishment = ref(null);
const selectedClientId = ref("");
const loyaltyError = ref("");

const paidVisits = ref(0);
const totalVisitsRequired = ref(9);
const rewardsToClaim = ref(0);
const rewardsClaimed = ref(0);

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
    loyaltyModalInstance = new bootstrap.Modal(loyaltyModalRef.value);
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
const openLoyaltyModal = async (est) => {
  selectedEstablishment.value = est;
  selectedClientId.value = "";
  paidVisits.value = 0;
  totalVisitsRequired.value = 9;
  rewardsToClaim.value = 0;
  rewardsClaimed.value = 0;
  loyaltyError.value = "";

  try {
    const res = await fetch("http://localhost:8000/api/clients", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (!res.ok) throw new Error("Erro ao carregar clientes");
    clients.value = await res.json();
    loyaltyModalInstance.show();
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar clientes");
  }
};
const createLoyaltyCard = async () => {
  loyaltyError.value = "";

  if (!selectedClientId.value) {
    loyaltyError.value = "Selecione um cliente.";
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/api/loyalty-cards/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        establishment_id: selectedEstablishment.value.id,
        client_id: selectedClientId.value,
        paid_visits: paidVisits.value,
        total_visits_required: totalVisitsRequired.value,
        rewards_to_claim: rewardsToClaim.value,
        rewards_claimed: rewardsClaimed.value,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao criar cartão");
    }

    loyaltyModalInstance.hide();
    alert("Cartão fidelidade criado com sucesso!");
  } catch (err) {
    loyaltyError.value = err.message;
  }
};
</script>
