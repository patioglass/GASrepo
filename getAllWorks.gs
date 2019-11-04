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

function doGet(e) {
  var data = getData();
  // jsonpで返す
  var response =  e.parameter.callback + '(' + JSON.stringify(data) + ')';
  var output = ContentService.createTextOutput(response);
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);

  return output;
}