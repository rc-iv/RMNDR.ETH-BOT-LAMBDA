const moment = require("moment-timezone");

// function to validate time is in mm:HH format and date is in DD-MM-YYYY format
function validateDateTime(date, time) {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
  
    console.log(`date: ${date}, time: ${time}`)
    console.log(`dateRegex.test(date): ${dateRegex.test(date)}, timeRegex.test(time): ${timeRegex.test(time)}`)
    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      return false;
    }
  
    const dateParts = date.split("-");
    const timeParts = time.split(":");
  
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[0]);
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    
    const utcDateTime = moment
      .utc()
      .year(year)
      .month(month)
      .date(day)
      .hour(hour)
      .minute(minute);
    
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return false;
    }
    if (!utcDateTime.isValid()) {
      return false;
    }
  
    return true;
  }

function convertToUTC(date, time, timezone) {
  const combinedDateTime = `${date} ${time}`;
  console.log(`combinedDateTime: ${combinedDateTime}`)
  console.log(`timezone: ${timezone}`)
  const utcDateTime = moment
    .tz(combinedDateTime, "MM-DD-YYYY HH:mm", timezone)
    .utc()
    .format();
  console.log(`utcDateTime: ${utcDateTime}`)
  return utcDateTime;
}

module.exports = {
    validateDateTime,
    convertToUTC,
    };