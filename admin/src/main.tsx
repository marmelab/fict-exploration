import { render } from "fict";
import { Admin, type ResourceConfigs } from "./admin/Admin";
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

function App() {
  return <Admin resources={resources} />;
}

render(() => <App />, document.getElementById("app")!);
