import React from "react";
import * as S from "./styles";
import WheaterCard from "../Widgets/WeatherCard";

import ForecastNextDays from "../Widgets/ForecastNextDays";
import Image from "../Image";

function Main({ children }) {
  return (
    <S.Main>
      <S.Section>
        <S.Mask>
          <S.Article>
            <WheaterCard />
            <ForecastNextDays>
              <h4>Previsão para os proximos 4 dias</h4>
            </ForecastNextDays>
          </S.Article>
        </S.Mask>
        <Image />
      </S.Section>
    </S.Main>
  );
}

export default Main;
