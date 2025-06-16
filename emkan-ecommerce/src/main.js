import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import AOS from "aos";
import "aos/dist/aos.css";
import router from "./router";
import "./assets/tailwind.css";
import "./assets/style.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(fas, fab);

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
const pinia = createPinia();
app.use(pinia);

app.use(router);
app.mount("#app");
AOS.init();
