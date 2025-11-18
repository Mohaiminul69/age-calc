document.querySelector("#app").innerHTML = `
  <div>
    <h1>Hello Dew!</h1>
    <div class="card">
      <p id="age"></p>
      <p id="next"></p>
    </div>
  </div>
`;

setInterval(() => {
  const { years, months, days, hours, minutes, seconds } = calculateAgeDetailed(
    "1993-02-09T00:00:00"
  );
  const countdown = getNextBirthdayCountdown(2, 9);

  document.querySelector(
    "#age"
  ).innerHTML = `Your age is ${years} years ${months} months ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
  document.querySelector(
    "#next"
  ).innerHTML = `Next birthday in ${countdown.months} months 
     ${countdown.days} days 
     ${countdown.hours} hours 
     ${countdown.minutes} minutes 
     ${countdown.seconds} seconds`;
}, 1000);
