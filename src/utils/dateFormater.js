function dateFormater(date) {
  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();

  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;

  return month + '/' + day + '/' + year;
}

export default dateFormater;
