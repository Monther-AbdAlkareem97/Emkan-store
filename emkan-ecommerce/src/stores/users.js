import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const useUsersStore = defineStore("users", () => {
  const users = ref({}); // users keyed by id
  const loading = ref(false);
  const error = ref(null);

  async function fetchUsers() {
    loading.value = true;
    try {
      const res = await axios.get("/users");
      users.value = Object.fromEntries(res.data.map((u) => [u.id, u]));
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(id) {
    loading.value = true;
    try {
      const res = await axios.get(`/users/${id}`);
      users.value[res.data.id] = res.data;
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function addUser(userData) {
    loading.value = true;
    try {
      const userWithDefaults = {
        ...userData,
        photo: userData.photo || "/profile.jpg",
        phone: userData.phone || "",
        address: userData.address || "",
        password: userData.password || "",
      };
      const res = await axios.post("/users", userWithDefaults);
      users.value[res.data.id] = res.data;
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id, userData) {
    loading.value = true;
    try {
      const userWithDefaults = {
        ...userData,
        photo: userData.photo || "/profile.jpg",
        phone: userData.phone || "",
        address: userData.address || "",
        password: userData.password || "",
      };
      const res = await axios.put(`/users/${id}`, userWithDefaults);
      users.value[res.data.id] = res.data;
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id) {
    loading.value = true;
    try {
      await axios.delete(`/users/${id}`);
      delete users.value[id];
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    addUser,
    updateUser,
    deleteUser,
  };
});
