import React, {
  createContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import useSWR, { SWRResponse } from "swr";
import dayjs from "dayjs";
import { fetcher } from "../../services/api";
import useMyGeolocation from "../../hooks/useMyGeolocation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import {
  IWeatherResponse,
  ICurrentWeather,
  IDailyWeather,
} from "../../types/wheatherData";

export type TDailyWeatherFormat = Omit<IDailyWeather, "dt"> & { dt: String };
type TCurrentWeatherFormat = Omit<ICurrentWeather, "dt"> & { dt: String };
export type TWeatherCurrentWithDaily = TDailyWeatherFormat &
  Omit<TCurrentWeatherFormat, "temp" | "feels_like">;

type TPropsContext = {
  weatherCurrent: TCurrentWeatherFormat;
  weatherDaily: Array<TDailyWeatherFormat>;
  getWeatherCurrentWithDaily: TWeatherCurrentWithDaily;
  selectedDay: String;
  setSelectedDay: Function;
  handleGetDayWeather: Function;
  getDataDaySelected: Function;
  dateCurrentWeather: String;
  mutate: Function;
  isValidating: Boolean;
};

const DefaultValue = {
  weatherCurrent: null,
  weatherDaily: null,
  getWeatherCurrentWithDaily: null,
  selectedDay: null,
  setSelectedDay: () => {},
  handleGetDayWeather: () => {},
  getDataDaySelected: () => {},
  dateCurrentWeather: null,
  mutate: () => {},
  isValidating: null,
};

const WeatherContext = createContext<TPropsContext>(DefaultValue);

function WeatherProvider({ children }) {
  const [weatherCurrent, setWeatherCurrent] = useState<TCurrentWeatherFormat>();
  const [weatherDaily, setWeatherDaily] =
    useState<Array<TDailyWeatherFormat>>();
  const [selectedDay, setSelectedDay] = useState<String>();
  const [dateCurrentWeather, setDateCurrentWeather] = useState<String>();

  const { coords, loading } = useMyGeolocation();

  const { data, error, mutate, isValidating }: SWRResponse<IWeatherResponse> =
    useSWR(
      !loading
        ? `onecall?lat=${coords.latitude}&lon=${coords.longitude}`
        : null,
      fetcher
    );

  const setDailyWeather = () => {
    if (!!data?.daily) {
      const dailyFormat = data?.daily.map((daily) => {
        return { ...daily, dt: dayjs.unix(daily.dt).format("DD/MM/YYYY") };
      });
      setWeatherDaily(dailyFormat);
    }
  };

  const setDataWeatherCurrent = () => {
    if (!!data?.current) {
      setWeatherCurrent({
        ...data?.current,
        dt: dayjs.unix(data?.current.dt).format("DD/MM/YYYY"),
      });
    }
  };

  const handleGetDayWeather = useCallback(
    (dateDay: String) => {
      const day = weatherDaily?.find((daily) => daily.dt === dateDay);
      return day;
    },
    [weatherDaily]
  );

  const getDataDaySelected = useCallback(() => {
    const day = weatherDaily?.find((daily) => daily.dt === selectedDay);
    return day;
  }, [selectedDay]);

  const getWeatherCurrentWithDaily = useMemo(() => {
    const dailyCurrent = handleGetDayWeather(weatherCurrent?.dt);
    const weather = {
      ...weatherCurrent,
      ...dailyCurrent,
      clouds: weatherCurrent?.clouds,
    };
    return weather;
  }, [weatherDaily, weatherCurrent]);

  const formatDateCurrentWheater = useCallback(() => {
    setDateCurrentWeather(
      dayjs.unix(data?.current.dt).format("DD/MM/YYYY HH:mm")
    );
  }, [data?.current.dt]);

  useEffect(() => {
    setSelectedDay(weatherCurrent?.dt);
  }, [weatherCurrent?.dt]);

  useEffect(() => {
    setDataWeatherCurrent();
    setDailyWeather();
    formatDateCurrentWheater();
  }, [data]);

  useEffect(() => {
    if (error)
      toast.error("Desculpe, ocorreu um erro!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  }, [error]);

  useEffect(() => {
    if (isValidating && !error && data)
      toast.success("Os dados foram atualizados com sucesso!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  }, [isValidating]);

  const value = useMemo(
    () => ({
      weatherCurrent,
      weatherDaily,
      getWeatherCurrentWithDaily,
      selectedDay,
      setSelectedDay,
      handleGetDayWeather,
      getDataDaySelected,
      dateCurrentWeather,
      mutate,
      isValidating,
    }),
    [
      weatherCurrent,
      weatherDaily,
      getWeatherCurrentWithDaily,
      selectedDay,
      dateCurrentWeather,
      isValidating,
    ]
  );

  return (
    <WeatherContext.Provider value={value}>
      <ToastContainer />
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherContext, WeatherProvider };
