import { eachWeekendOfYear, getDaysInYear } from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";

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
  const days = getDaysInYear(now);
  const weekends = eachWeekendOfYear(now).length;
  const weekdays = days - weekends;
  const publicHolidays = 10;
  const publicHolidaysOnWeekdays = 5;
  const workingDays =
    weekdays - publicHolidaysOnWeekdays - vacationDays - sickDays;

  return (
    <div>
      <h1>{year}</h1>
      <ul>
        <li>Days: {days}</li>
        <li>Weekends: {weekends}</li>
        <li>Weekdays: {weekdays}</li>
        <li>Public Holidays: {publicHolidays}</li>
        <li>Vacation Days: {vacationDays}</li>
        <li>Sick Days: {sickDays}</li>
        <li>Working Days: {workingDays}</li>
      </ul>
    </div>
  );
}

export default App;
