function getData() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheetContents = {};
  // シート含め全取得(年ごとにシートを分けている)
  // 年→{各シートの行...} となる配列を作る
  sheets.forEach(function(sheet) {
    var rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet.getName()).getDataRange().getValues();
    var keys = rows.splice(0, 1)[0];

    sheetContents[sheet.getName()] = rows.map(function(row) {
      var obj = {};
      row.map(function(item, index) {
        obj[keys[index]] = item;
      });
      return obj;
    });
  });
  return sheetContents;
}

// シートが1つの場合
// カラム名(年)をキーにした配列を返す
// 年→{各シートの行...} となる配列を作る
function getWorksByDate() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Works');
    var rows = sheet.getDataRange().getValues();
    var currentYear = new Date().getFullYear();
    /*
      date | title | detail | type
    */
    // カラム名
    var keys = rows.splice(0, 1)[0];
    var obj = {};
    for(var i = 2013; i <= currentYear; i++) {
      obj[String(i)] = [];
    }
    rows.forEach(function(row) {
      var contents = {};
      row.map(function(item, index) {
        contents[keys[index]] = item;
      });
      obj[String(new Date(row[0]).getFullYear())].push(contents);
    });

    return obj;
}

function doGet(e) {
  var data = getData();
  // jsonpで返す
  var response =  e.parameter.callback + '(' + JSON.stringify(data) + ')';
  var output = ContentService.createTextOutput(response);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);

  return output;
}