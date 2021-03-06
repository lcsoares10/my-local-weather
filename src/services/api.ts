import axios from "axios";

const urlApiWheater = process.env.NEXT_PUBLIC_URL_API || "";
const appid = process.env.NEXT_PUBLIC_KEY_OPEN_WEATHER || "";

const apiAxios = axios.create({
  baseURL: urlApiWheater,
  params: {
    appid,
    lang: "pt_br",
    exclude: "minutely,hourly,alerts",
    units: "metric",
  },
});

export const fetcher = (url) => apiAxios.get(url).then((res) => res.data);
