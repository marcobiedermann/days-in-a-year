import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

const instance = axios.create({
  baseURL: "https://openholidaysapi.org",
});

const countrySchema = z.object({
  isoCode: z.string(),
  name: z.array(
    z.object({
      language: z.string(),
      text: z.string(),
    })
  ),
});

const countriesSchema = z.array(countrySchema);

async function getCountries() {
  const { data } = await instance.get("/Countries");

  return countriesSchema.parse(data);
}

function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
}

interface PublicHolidaysOptions {
  countryIsoCode: string;
  validFrom: string;
  validTo: string;
  subdivisionCode: string;
}

const publicHolidaySchema = z.object({
  id: z.string(),
  startDate: z.string().date(),
  name: z.array(
    z.object({
      language: z.string(),
      text: z.string(),
    })
  ),
});

const publicHolidaysSchema = z.array(publicHolidaySchema);

async function getPublicHolidays(options: PublicHolidaysOptions) {
  const { countryIsoCode, validFrom, validTo, subdivisionCode } = options;
  const { data } = await instance.get("/PublicHolidays", {
    params: {
      countryIsoCode,
      validFrom,
      validTo,
      subdivisionCode,
    },
  });

  return publicHolidaysSchema.parse(data);
}

interface Options {
  enabled: boolean;
}

function usePublicHolidays(params: PublicHolidaysOptions, options: Options) {
  const { countryIsoCode, validFrom, validTo, subdivisionCode } = params;

  return useQuery({
    queryKey: ["publicHolidays", countryIsoCode, validFrom, validTo],
    queryFn: () =>
      getPublicHolidays({
        countryIsoCode,
        subdivisionCode,
        validFrom,
        validTo,
      }),
    ...options,
  });
}

const subdivisionSchema = z.object({
  code: z.string(),
  name: z.array(
    z.object({
      language: z.string(),
      text: z.string(),
    })
  ),
});

const subdivisionsSchema = z.array(subdivisionSchema);

async function getSubdivisions(countryIsoCode: string) {
  const { data } = await instance.get("/Subdivisions", {
    params: {
      countryIsoCode,
    },
  });

  return subdivisionsSchema.parse(data);
}

function useSubdivisions(countryIsoCode: string) {
  return useQuery({
    queryKey: ["subdivisions", countriesSchema],
    queryFn: () => getSubdivisions(countryIsoCode),
  });
}

export { useCountries, usePublicHolidays, useSubdivisions };
