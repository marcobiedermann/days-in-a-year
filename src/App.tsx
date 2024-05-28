import { eachWeekendOfYear, getDaysInYear } from "date-fns";

function App() {
  const year = "2024";
  const now = new Date(year);
  const days = getDaysInYear(now);
  const weekends = eachWeekendOfYear(now).length;
  const weekdays = days - weekends;
  const publicHolidays = 10;
  const publicHolidaysOnWeekdays = 5;
  const vacationDays = 30;
  const sickDays = 2;
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
