
/*
 * 表示できるURLに変更
 * @param string url (https://drive.google.com/file/d/[folderId]/view)
 * @return string https://drive.google.com/uc?id=[folderId]
 */
function convImageUrl(url) {
  var imageUrlPath = url.split('/');
  var convImageUrl = 'https://drive.google.com/uc?id=' + imageUrlPath[imageUrlPath.length - 2];
  return convImageUrl;
}


/*
 * スプレッドシートに書き込む
 * @param array list {title => url}
 * @param string sheetName 書き込むシート名
 * @param int rowIndex 書き込み開始位置
 * @param int colIndex 書き込み開始位置
 * @
 */
function writeSpreadSheet(list, sheetName, rowIndex, colIndex) {
  var spreadSheet = SpreadsheetApp.getActive();
  var sheet = spreadSheet.getSheetByName(sheetName);
  
  // シートがなかったら作成
  if (sheet === null) {
    sheet = spreadSheet.insertSheet(sheetName);
    var columnNames = [
      [ "title", "url", "month" ]
    ];  
    var initRange = sheet.getRange(1, 1, columnNames.length, columnNames[0].length);
    initRange.setValues(columnNames);
  }
  
  var range = sheet.getRange(rowIndex, colIndex, list.length, list[0].length);
  // 対象の範囲にまとめて書き出し
  range.setValues(list);
}

/*
 * フォルダ以下にある子フォルダのIDリストを取得する
 * @param string folderId 親フォルダID
 * @return array childFolderIdList 子フォルダのIDリスト
 */
function searchFolderIds(folderId) {
  var childFolderIdList = [];
  var folder = DriveApp.getFolderById(folderId);
  var childFolders= folder.getFolders();
  while(childFolders.hasNext()) {
    var child = childFolders.next();
    var childPath = child.getUrl().split('/');
    childFolderIdList[child.getName()] = childPath[childPath.length - 1];
  }
  return childFolderIdList;
}

/*
 * フォルダ以下にある画像データをAPIで叩けるようにスプレッドシートに書き込む(これを実行する)
 * ディレクトリ構成
 * | - year
   |     | - 2019
   |     |    |  - 1月
   |     |    |  - 2月
   |     |    |  - 3月 
   |     | - 2018
   |     | - 2017
 */
function updateAllImageData() {
  // ルートになる場所
  //  getRootDirectoryIdは別ファイルでconfig的に定義
  const baseFolderId = getRootDirectoryId();
  var yearFolders = searchFolderIds(baseFolderId);

  // 年ディレクトリ
  Object.keys(yearFolders).forEach(function(yearIndex) {
    Logger.log(yearFolders[yearIndex]);

    var imageList = [];

    var monthFolders = searchFolderIds(yearFolders[yearIndex]);
    Logger.log(monthFolders);
    // 月ディレクトリ
    Object.keys(monthFolders).forEach(function(monthIndex) {
      var imageFolder = DriveApp.getFolderById(monthFolders[monthIndex]);
      var imageFiles = imageFolder.getFiles();
      while(imageFiles.hasNext()) {
        var image = imageFiles.next();
        // png,jpgファイル取得
        if (image.getName().match(/.*\.png|\.jpg$/)) {
          imageList.push([image.getName(), convImageUrl(image.getUrl()), monthIndex.replace('月', '')]);
        }
      }
      imageList = imageList.reverse();
      // スプレッドシート書き込み
      writeSpreadSheet(imageList, yearIndex, 2, 1);
    })
  })
}
