import { createVaporApp } from "@vue/runtime-vapor";
import Admin from "./admin/Admin.vue";
import type { ResourceConfigs } from "./admin/types";
import "./index.css";

const resources: ResourceConfigs = [
  {
    name: "posts",
    listFields: [
      { source: "id", label: "ID" },
      { source: "title", label: "Title" },
      { source: "userId", label: "User ID" },
    ],
    showFields: [
      { source: "id", label: "ID" },
      { source: "title", label: "Title" },
      { source: "body", label: "Body" },
      { source: "userId", label: "User ID" },
    ],
  },
  {
    name: "users",
    listFields: [
      { source: "id", label: "ID" },
      { source: "name", label: "Name" },
      { source: "email", label: "Email" },
      { source: "phone", label: "Phone" },
    ],
    showFields: [
      { source: "id", label: "ID" },
      { source: "name", label: "Name" },
      { source: "username", label: "Username" },
      { source: "email", label: "Email" },
      { source: "phone", label: "Phone" },
      { source: "website", label: "Website" },
    ],
  },
  {
    name: "todos",
    listFields: [
      { source: "id", label: "ID" },
      { source: "title", label: "Title" },
      { source: "completed", label: "Completed" },
    ],
    showFields: [
      { source: "id", label: "ID" },
      { source: "title", label: "Title" },
      { source: "completed", label: "Completed" },
      { source: "userId", label: "User ID" },
    ],
  },
];

createVaporApp(Admin, { resources }).mount("#app");
