import {
  eachWeekendOfYear,
  endOfYear,
  formatISO,
  getDaysInYear,
  isWeekend,
  startOfYear,
} from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { usePublicHolidays, useSubdivisions } from "./openholidays";

const paramsSchema = z.object({
  year: z.string(),
});

const searchParamsSchema = z.object({
  vacationDays: z.coerce.number().min(0).max(99).default(20),
  sickDays: z.coerce.number().min(0).max(365).default(0),
});

function App() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { year } = paramsSchema.parse(params);
  const { sickDays, vacationDays } = searchParamsSchema.parse(
    Object.fromEntries(searchParams.entries())
  );
  const now = new Date(year);
  const start = startOfYear(now);
  const end = endOfYear(now);
  const countryIsoCode = "DE";
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
      subdivisionCode: "DE-BE",
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

  if (isPending) {
    return <div>Loading …</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  console.log({ publicHolidays });

  return (
    <div>
      <h1>{year}</h1>
      <select name="country" id="country">
        {subdivisions?.map((subdivision) => (
          <option value={subdivision.code} key={subdivision.code}>
            {
              subdivision.name.find((name) => name.language === countryIsoCode)
                ?.text
            }
          </option>
        ))}
      </select>
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
