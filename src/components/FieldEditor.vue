<template>
  <div class="mb-3">
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <strong>{{ label }}:</strong>
        <span v-if="!editing">
          <!-- Espaço após os dois-pontos -->
          {{ value ? ` ${value}` : " Sem info" }}
        </span>
        <span v-else>
          <input
            v-model="editedValue"
            class="form-control form-control-sm d-inline-block"
            style="width: 250px"
          />
        </span>
      </div>

      <div>
        <button
          v-if="!editing"
          class="btn btn-sm btn-outline-primary"
          @click="startEdit"
        >
          Editar
        </button>

        <template v-else>
          <button class="btn btn-sm btn-success me-1" @click="saveEdit">
            Salvar
          </button>
          <button class="btn btn-sm btn-secondary" @click="cancelEdit">
            Cancelar
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  label: String,
  value: String,
  field: String,
});

const emit = defineEmits(["update"]);

const editing = ref(false);
const editedValue = ref(props.value);

watch(
  () => props.value,
  (newVal) => {
    if (!editing.value) {
      editedValue.value = newVal;
    }
  }
);

const startEdit = () => {
  editing.value = true;
};

const cancelEdit = () => {
  editing.value = false;
  editedValue.value = props.value;
};

const saveEdit = () => {
  emit("update", {
    field: props.field,
    value: editedValue.value,
  });
  editing.value = false;
};
</script>
