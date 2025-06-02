<template>
  <div class="container mt-5" v-if="establishment">
    <div class="card shadow-sm">
      <div class="card-header bg-danger text-white">
        <h4 class="mb-0">Detalhes do Estabelecimento</h4>
      </div>
      <div class="card-body">
        <FieldEditor
          label="Nome do estabelecimento"
          :value="establishment.establishment_name"
          field="establishment_name"
          @update="updateField"
        />
        <FieldEditor
          label="Endereço"
          :value="establishment.address"
          field="address"
          @update="updateField"
        />
        <FieldEditor
          label="Número"
          :value="establishment.number"
          field="number"
          @update="updateField"
        />
        <FieldEditor
          label="Complemento"
          :value="establishment.complement"
          field="complement"
          @update="updateField"
        />
        <FieldEditor
          label="CEP"
          :value="establishment.cep"
          field="cep"
          @update="updateField"
        />
        <FieldEditor
          label="Cidade"
          :value="establishment.city"
          field="city"
          @update="updateField"
        />
        <FieldEditor
          label="Estado"
          :value="establishment.state"
          field="state"
          @update="updateField"
        />
        <FieldEditor
          label="País"
          :value="establishment.country"
          field="country"
          @update="updateField"
        />
        <hr />
        <p><strong>Dono(a): </strong> {{ establishment.owner.name }}</p>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-outline-danger" @click="confirmDelete">
            Deletar Estabelecimento
          </button>
        </div>

        <router-link to="/dashboard" class="btn btn-secondary mt-3">
          Voltar para o Dashboard
        </router-link>
      </div>
    </div>
  </div>

  <div class="text-center mt-5" v-else>
    <div class="spinner-border text-danger" role="status"></div>
    <p class="mt-3">Carregando estabelecimento...</p>
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
          <strong>{{ establishment?.establishment_name }}</strong
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { token } from "../store/auth.js";
import FieldEditor from "../components/FieldEditor.vue";

const route = useRoute();
const router = useRouter();
const establishment = ref(null);

const deleteModalRef = ref(null);
let deleteModalInstance = null;

onMounted(async () => {
  const id = route.params.id;

  try {
    const res = await fetch(`http://localhost:8000/api/establishments/${id}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!res.ok) throw new Error("Estabelecimento não encontrado");

    establishment.value = await res.json();

    // Carrega Bootstrap dinamicamente e instancia o modal
    const bootstrap = await import("bootstrap");
    deleteModalInstance = new bootstrap.Modal(deleteModalRef.value);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar estabelecimento.");
    router.push("/dashboard");
  }
});

const updateField = async ({ field, value }) => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/establishments/${establishment.value.id}/update`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      }
    );

    if (!res.ok) throw new Error("Erro ao atualizar");

    const updated = await res.json();
    establishment.value[field] = updated[field];
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar o campo");
  }
};

const confirmDelete = () => {
  deleteModalInstance.show();
};

const deleteEstablishment = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/api/establishments/${establishment.value.id}/delete`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (!res.ok) throw new Error("Erro ao deletar");

    deleteModalInstance.hide();
    alert("Estabelecimento deletado com sucesso!");
    router.push("/dashboard");
  } catch (err) {
    console.error(err);
    alert("Erro ao deletar estabelecimento");
  }
};
</script>
