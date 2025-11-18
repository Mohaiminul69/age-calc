function parseToDate(input) {
  // Accept Date object or string. Prefer ISO-like input to avoid ambiguous parsing.
  if (input instanceof Date) return input;
  // Try to create a Date in UTC by appending 'Z' if no timezone present (careful).
  // If user supplies "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS", treat as local vs UTC carefully.
  // Here we try: if input includes 'T' or timezone indicator, let Date parse it.
  if (typeof input === "string") {
    // Best practice: user should pass ISO 8601 with timezone (e.g. "1993-02-09T00:00:00Z")
    return new Date(input);
  }
  throw new TypeError("Unsupported date input");
}

function daysInMonthUTC(year, monthIndex) {
  // monthIndex: 0..11. Using day=0 on next month returns last day of requested month.
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Returns the exact difference between birth and target as an object:
 * { years, months, days, hours, minutes, seconds }
 * Uses UTC components to avoid timezone shifts.
 *
 * Pass ISO strings or Date objects. For predictable results pass ISO with Z (UTC).
 */
function calculateAgeDetailed(birthInput, targetInput = new Date()) {
  const birthDate = parseToDate(birthInput);
  const targetDate = parseToDate(targetInput);

  // If either failed to parse, Date will be invalid; handle that:
  if (isNaN(birthDate) || isNaN(targetDate)) {
    throw new Error("Invalid date(s) provided");
  }

  // If target < birth, return zeros (or you could return negative)
  if (targetDate < birthDate) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // Use UTC components to avoid DST/local timezone issues
  let by = birthDate.getUTCFullYear();
  let bm = birthDate.getUTCMonth(); // 0..11
  let bd = birthDate.getUTCDate(); // 1..31
  let bh = birthDate.getUTCHours();
  let bmin = birthDate.getUTCMinutes();
  let bs = birthDate.getUTCSeconds();

  let ty = targetDate.getUTCFullYear();
  let tm = targetDate.getUTCMonth();
  let td = targetDate.getUTCDate();
  let th = targetDate.getUTCHours();
  let tmin = targetDate.getUTCMinutes();
  let ts = targetDate.getUTCSeconds();

  let years = ty - by;
  let months = tm - bm;
  let days = td - bd;
  let hours = th - bh;
  let minutes = tmin - bmin;
  let seconds = ts - bs;

  // Borrow seconds -> minutes
  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }

  // Borrow minutes -> hours
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }

  // Borrow hours -> days
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }

  // Borrow days -> months (need days in previous month of target)
  if (days < 0) {
    // When borrowing days, we need to take the number of days in the month prior to the current target month.
    // That month is (tm - 1) in the same year, but if tm == 0 (Jan) then previous month is Dec of previous year.
    let prevMonthIndex = tm - 1;
    let prevMonthYear = ty;
    if (prevMonthIndex < 0) {
      prevMonthIndex = 11;
      prevMonthYear = ty - 1;
    }
    const daysInPrevMonth = daysInMonthUTC(prevMonthYear, prevMonthIndex);
    days += daysInPrevMonth;
    months -= 1;
  }

  // Borrow months -> years
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  // At this point years, months, days, hours, minutes, seconds are non-negative
  return {
    years: years,
    months: months,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

function getNextBirthdayCountdown(birthMonth, birthDay) {
  const now = new Date();

  // Find next birthday year
  let nextBirthdayYear = now.getFullYear();
  const birthdayThisYear = new Date(
    Date.UTC(nextBirthdayYear, birthMonth - 1, birthDay)
  );

  // If birthday already passed this year → next year
  if (birthdayThisYear < now) {
    nextBirthdayYear++;
  }

  const nextBirthday = new Date(
    Date.UTC(nextBirthdayYear, birthMonth - 1, birthDay)
  );

  return calculateAgeDetailed(now, nextBirthday);
}
