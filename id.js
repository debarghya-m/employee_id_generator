let allData,
  searchKey = "",
  filterData;
window.onload = function () {
  async function Outside_Test() {
    var reso = await Get_JSON();
    if (reso && reso.length > 0) {
      localStorage.setItem("csv-data", JSON.stringify(reso));
      allData = reso;
      filterData = reso;
      showData(reso);
    }
  }
  async function Get_JSON() {
    var url = "./data.xlsx";
    var workbook = await Get_XLSX_As_Workbook_From_URL(url);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    var reso = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
    });
    return reso;
  }
  async function Get_XLSX_As_Workbook_From_URL(url) {
    const arrayBuffer = await new Promise((resolve, reject) => {
      var oReq = new XMLHttpRequest();
      oReq.open("GET", url, true);
      oReq.responseType = "arraybuffer";
      oReq.onload = () => resolve(oReq.response);
      oReq.onerror = reject;
      oReq.send();
    });
    var data = new Uint8Array(arrayBuffer);
    var arr = new Array();
    for (var i = 0; i != data.length; ++i)
      arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");
    var workbook = XLSX.read(bstr, {
      type: "binary",
    });
    return workbook;
  }
  Outside_Test();
};
function showData(data) {
  let tr = document.createElement("tr");
  for (var key in data[0]) {
    let th = document.createElement("th");
    th.innerHTML = key;
    tr.appendChild(th);
  }
  let th = document.createElement("th");
  th.innerHTML = "Action";
  tr.appendChild(th);
  document.getElementById("data-thead")?.appendChild(tr);
  generateTbody(data);
}
function generateTbody(data) {
  document.getElementById("data-tbody").innerHTML = "";
  let keys = [];
  for (var key in data[0]) {
    keys.push(key);
  }
  data.forEach((element, index) => {
    let tr = document.createElement("tr");
    keys.forEach((key) => {
      let td = document.createElement("td");
      td.innerHTML = element[key];
      tr.appendChild(td);
    });
    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.textContent = "Print";
    btn.setAttribute("class", "btn btn-primary");
    btn.setAttribute("onclick", "printDi(" + index + ")");

    td.appendChild(btn);
    tr.appendChild(td);
    document.getElementById("data-tbody")?.appendChild(tr);
  });
}
function printDi(index) {
  console.log(filterData[index]);
  var qrcodeDiv = document.getElementById("qrcode");
  var qrcodeString = document.getElementById("qrstring");
  qrcodeDiv.innerHTML = "";
  qrcodeString.innerHTML = filterData[index].customer_name;
  var text = filterData[index].mac_vc_number;
  var qrcode = new QRCode(qrcodeDiv, {
    text: text,
    width: 100,
    height: 100,
  });
  setTimeout(() => {
    var divElement = document.getElementById("printableArea");
    var divWidth = divElement.clientWidth;
    var divHeight = divElement.clientHeight;
    const styleElement = document.getElementById("page-style");
    const cssRule = `@page {
            size: ${divHeight * 0.3}mm;
            margin: 0mm;
          }`;
    styleElement.textContent = cssRule;
    var printContents = divElement.innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  }, 100);
}
function searchParam(val) {
  searchKey = val;
  let newArray = allData.filter((ele) => {
    return ele.customer_name.match(new RegExp(searchKey, "i"));
  });
  filterData = newArray;
  generateTbody(newArray);
}
