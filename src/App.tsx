/* eslint-disable @typescript-eslint/ban-ts-comment */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eachWeekendOfYear,
  endOfYear,
  formatISO,
  getDaysInYear,
  isWeekend,
  startOfYear,
} from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useSearchParams } from "react-router-dom";
import { ZodObject, ZodRawShape, z } from "zod";
import { usePublicHolidays, useSubdivisions } from "./openholidays";

const paramsSchema = z.object({
  year: z.string(),
});

const searchParamsSchema = z.object({
  vacationDays: z.coerce.number().default(20),
  sickDays: z.coerce.number().default(0),
  subdivisionCode: z.string().optional(),
  countryIsoCode: z.string().optional().default("DE"),
});

function parseSearchParams<T extends ZodRawShape>(
  searchParams: URLSearchParams,
  schema: ZodObject<T>
) {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}

const formDataSchema = z.object({
  countryIsoCode: z.string(),
  subdivisionCode: z.string(),
  sickDays: z.number().int(),
  vacationDays: z.number().int(),
});

type FormData = z.infer<typeof formDataSchema>;

function App() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { year } = paramsSchema.parse(params);
  const defaultValues = parseSearchParams(searchParams, searchParamsSchema);
  const { register, watch, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues,
  });

  const now = new Date(year);
  const start = startOfYear(now);
  const end = endOfYear(now);
  const { countryIsoCode, subdivisionCode, vacationDays, sickDays } = watch();
  // const { data: countries, isPending, isError, error } = useCountries();
  const { data: subdivisions } = useSubdivisions(countryIsoCode);
  const {
    data: publicHolidays = [],
    isPending,
    isError,
    error,
  } = usePublicHolidays(
    {
      countryIsoCode,
      subdivisionCode,
      validFrom: formatISO(start, { representation: "date" }),
      validTo: formatISO(end, { representation: "date" }),
    },
    {
      enabled: Boolean(subdivisions),
    }
  );

  const days = getDaysInYear(now);
  const weekends = eachWeekendOfYear(now).length;
  const weekdays = days - weekends;
  const numberOfPublicHolidays = publicHolidays.length;
  const publicHolidaysOnWeekends = publicHolidays
    .map((publicHoliday) => new Date(publicHoliday.startDate))
    .filter(isWeekend).length;
  const publicHolidaysOnWeekdays =
    numberOfPublicHolidays - publicHolidaysOnWeekends;
  const workingDays =
    weekdays - publicHolidaysOnWeekdays - vacationDays - sickDays;

  function onSubmit(data: FormData) {
    // @ts-ignore
    setSearchParams(data);
  }

  useEffect(() => {
    // @ts-ignore
    const subscription = watch(handleSubmit(onSubmit));

    // @ts-ignore
    return () => subscription.unsubscribe();
  }, [handleSubmit, watch]);

  if (isPending) {
    return <div>Loading …</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>{year}</h1>
      <form>
        <div>
          <label htmlFor="countryIsoCode">Country</label>
          <select id="countryIsoCode" {...register("countryIsoCode")}>
            <option value="DE">Deutschland</option>
          </select>
        </div>

        <div>
          <label htmlFor="subdivisionCode">Subdivision</label>
          <select id="subdivisionCode" {...register("subdivisionCode")}>
            {subdivisions?.map((subdivision) => (
              <option value={subdivision.code} key={subdivision.code}>
                {
                  subdivision.name.find(
                    (name) => name.language === countryIsoCode
                  )?.text
                }
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vacationDays">Vacation Days</label>
          <input
            type="number"
            {...register("vacationDays", {
              valueAsNumber: true,
            })}
          />
        </div>

        <div>
          <label htmlFor="sickDays">Sick Days</label>
          <input
            type="number"
            {...register("sickDays", {
              valueAsNumber: true,
            })}
          />
        </div>
      </form>

      <ul>
        <li>Days: {days}</li>
        <li>Weekends: {weekends}</li>
        <li>Weekdays: {weekdays}</li>
        <li>Public Holidays: {numberOfPublicHolidays}</li>
        <li>Vacation Days: {vacationDays}</li>
        <li>Sick Days: {sickDays}</li>
        <li>Working Days: {workingDays}</li>
      </ul>
    </div>
  );
}

export default App;
