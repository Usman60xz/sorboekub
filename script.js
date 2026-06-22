
let payments =
  JSON.parse(
    localStorage.getItem("payments")
  ) || [];

let members =
  JSON.parse(localStorage.getItem("members")) || [];

 let currentPage = 1;
const membersPerPage = 20; 

let history =
  JSON.parse(localStorage.getItem("history")) || [];
let currentEqubDay =
  parseInt(
    localStorage.getItem(
      "currentEqubDay"
    )
  ) || 0;

let receipts =
  JSON.parse(
    localStorage.getItem("receipts")
  ) || [];

let notifications =
  JSON.parse(localStorage.getItem("notifications")) || [];

async function loadMembersFromFirebase(){

  const snapshot = await getDocs(
    collection(db, "members")
  );

  members = [];

  snapshot.forEach((firebaseDoc) => {

    members.push({
      ...firebaseDoc.data(),
      docId: firebaseDoc.id
    });

  });

}
window.onload = async function(){

  await loadMembersFromFirebase();

  await loadEqubDay();

  loadApp();

}

async function loadEqubDay(){

  const dayDoc =
    await getDoc(
      doc(db, "settings", "equb")
    );

  if(dayDoc.exists()){

    currentEqubDay =
      dayDoc.data().currentEqubDay || 0;

  }

}
await loadEqubDay();
import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


 
function saveData(){

  localStorage.setItem(
    "members",
    JSON.stringify(members)
  );
localStorage.setItem(
  "currentEqubDay",
  currentEqubDay
);

  localStorage.setItem(
    "history",
    JSON.stringify(history)
  );

  localStorage.setItem(
    "notifications",
    JSON.stringify(notifications)
  );

  localStorage.setItem(
  "receipts",
  JSON.stringify(receipts)
  );

}


async function login(){

  const username =
    document.getElementById("username").value;

  const password =
  document.getElementById(
    "loginPassword"
  ).value;

  const role =
    document.getElementById("role").value;


  // ADMIN LOGIN
  if(
    username === "admin" &&
    password === "1234" &&
    role === "admin"
  ){

    document.getElementById("loginPage")
      .style.display = "none";

    document.getElementById("memberDashboard")
      .style.display = "none";

    document.getElementById("app")
      .style.display = "flex";

    loadApp();

    showSection("dashboard");

  }


  // MEMBER LOGIN
 else if(role === "member"){

  const snapshot =
  await getDocs(
    collection(db, "members")
  );

let member = null;

snapshot.forEach((doc) => {

  const data = doc.data();
  const memberName =
  (data.name || "").toLowerCase();

if (
  memberName ===
    username.toLowerCase() &&
  data.password === password
) member = {
  ...data,
  docId: doc.id
};


});
  if(member){

    document.getElementById("loginPage")
      .style.display = "none";

    document.getElementById("app")
      .style.display = "none";

    document.getElementById("memberDashboard")
      .style.display = "block";

    showMemberInfo(member);

  }else{

    alert(
      "Wrong username or password"
    );

  }

}
}
window.login = login;

function logout(){

  document.getElementById("app")
    .style.display = "none";

  document.getElementById("memberDashboard")
    .style.display = "none";

  document.getElementById("loginPage")
    .style.display = "block";

  document.getElementById("username").value = "";

  document.getElementById("password").value = "";

}
window.logout = logout;



async function addMember(){

  const name =
    document.getElementById("name").value;

  const amount =
    document.getElementById("amount").value;
  const phone =
    document.getElementById("phone").value;
  const password =
  document.getElementById(
    "memberPassword"
  ).value;

  const status =
    document.getElementById("status").value;
  const dueDate =
    document.getElementById("dueDate").value;
  const file =
    document.getElementById("profilePic")
    .files[0];

  const memberId = Date.now();

  if(name === "" || amount === "" || phone=== ""){
    alert("Please fill all fields");
    return;
  }


  const member = {
  id: memberId,
  name: name,
  phone: phone,
  password: password,
  amount: amount,
  status: status,
  dueDate: dueDate,
  image: "",
  payments: [],
  debt: 0
  
  };

  
  
  if(file){

  const reader = new FileReader();

  reader.onload = async function(e){

    member.image = e.target.result;

    await addDoc(
      collection(db, "members"),
      {
        id: memberId,
        name: name,
        phone: phone,
        password: password,
        amount: amount,
        status: status,
        dueDate: dueDate,
        debt: 0,
        payments: [],
        receipts: [],
        image: member.image
      }
    );

    members.push(member);

    saveData();

    loadApp();

  };

  reader.readAsDataURL(file);

}

else{

  await addDoc(
    collection(db, "members"),
    {
      id: memberId,
      name: name,
      phone: phone,
      password: password,
      amount: amount,
      status: status,
      dueDate: dueDate,
      debt: 0,
      payments: [],
      receipts: [],
      image: ""
    }
  );

  members.push(member);

  saveData();

  loadApp();

}

  history.push(
    `${name} paid ${amount} ETB (${status})`
  );
  const receipt = {
  id: Date.now(),
  member: name,
  amount: amount,
  status: status,
  date: new Date().toLocaleDateString()
  };

  receipts.push(receipt);


notifications.push(
  `${name}: Status is ${status}. Amount: ${amount} ETB`
);

  saveData();

  loadApp();


  document.getElementById("name").value = "";

  document.getElementById("amount").value = "";

}


function loadApp(){

  const receiptList =
  document.getElementById("receiptList");
  const memberList =
    document.getElementById("memberList");
  
  const paymentMember =
  document.getElementById(
    "paymentMember"
  );


if(paymentMember){
  paymentMember.innerHTML = "";
}
  
  if(receiptList){
  receiptList.innerHTML = "";
  } 

  memberList.innerHTML = "";
  
  if(receiptList){
  receiptList.innerHTML = "";
  }
  const paymentHistory =
  document.getElementById(
    "paymentHistory"
  );

if(paymentHistory){
  paymentHistory.innerHTML = "";
}


  let totalMoney = 0;
const start =
  (currentPage - 1) *
  membersPerPage;

const end =
  start +
  membersPerPage;

 members
  .slice(start,end)
  .forEach((member,index) => {

    const realIndex =
      start + index;
    const today =
  new Date();
  if(paymentMember){

  members.forEach((member) => {

    const option =
      document.createElement("option");

    option.value =
      member.name;

    option.textContent =
      member.name;

    paymentMember.appendChild(option);

  });

}

const due =
  new Date(member.dueDate);

let overdue = false;

if(
  due < today &&
  member.status === "Unpaid"
){
  overdue = true;
}

    totalMoney += parseInt(member.amount);


    const row =
  document.createElement("tr");

row.innerHTML = `

<td>
  <img
    src="${member.image}"
    width="50"
    height="50"
    style="border-radius:50%;"
  >
</td>

<td>${member.name}</td>

<td>${member.phone}</td>

<td>${member.amount} ETB</td>

<td>${member.status}</td>

  <button onclick="quickPay(${realIndex})">
  Pay
</button>

<button onclick="viewPayments(${member.id})">
  History
</button>
</button>
  <button onclick="editMember(${realIndex})">
    Edit
  </button>

  <button onclick="editImage(${realIndex})">
    Image
  </button>

  <button onclick="deleteMember(${realIndex})">
    Delete
  </button>

</td>
`;

memberList.appendChild(row);

  });
  if(receiptList){

  receipts.forEach((receipt) => {

    const li =
      document.createElement("li");

    li.innerHTML = `
      <strong>
        Receipt #${receipt.id}
      </strong>
      <br>
      Member: ${receipt.member}
      <br>
      Amount: ${receipt.amount} ETB
      <br>
      Status: ${receipt.status}
      <br>
      Date: ${receipt.date}
    `;

    receiptList.appendChild(li);

  });

  }

  if(paymentHistory){

  paymentHistory.innerHTML = "";

  payments.forEach((payment) => {

    const li =
      document.createElement("li");

    li.innerHTML = `
      <strong>${payment.member}</strong>
      <br>
      Amount: ${payment.amount} ETB
      <br>
      Month: ${payment.month}
      <br>
      Date: ${payment.date}
    `;

    paymentHistory.appendChild(li);

  });

}

  document.getElementById("totalMembers")
    .innerText = members.length;


  document.getElementById("totalMoney")
    .innerText = totalMoney + " ETB";
    
    const totalPages =
  Math.ceil(
    members.length /
    membersPerPage
  );

const pageInfo =
  document.getElementById(
    "pageInfo"
  );

if(pageInfo){

  pageInfo.innerText =
    `Page ${currentPage} of ${totalPages}`;

}
    const groupStats =
  document.getElementById("groupStats");

if(groupStats){

  const groups = {};

  members.forEach((member) => {

    if(!groups[member.amount]){
      groups[member.amount] = 0;
    }

    groups[member.amount]++;

  });

  groupStats.innerHTML = "";

  for(const amount in groups){

    groupStats.innerHTML += `
      <div class="card">
        <h3>${amount} ETB Group</h3>
        <p>${groups[amount]} Members</p>
      </div>
    `;

  }

}

}
window.loadApp = loadApp;


function editMember(index){

  const newName =
    prompt(
      members[index].name
    );

  const newAmount =
    prompt(
      "Edit amount",
      members[index].amount
    );


  if(newName && newAmount){

    members[index].name = newName;

    members[index].amount = newAmount;

    saveData();

    loadApp();

  }

}
window.editMember = editMember;

function deleteMember(index){

  members.splice(index,1);

  saveData();

  loadApp();

}
window.deleteMember = deleteMember;

function updateStats(){

  document.getElementById("totalMembers")
    .innerText = members.length;


  let totalMoney = 0;

  members.forEach(member => {
    totalMoney += parseInt(member.amount);
  });


  document.getElementById("totalMoney")
    .innerText = totalMoney + " ETB";


  const paid =
    members.filter(
      member => member.status === "Paid"
    ).length;


  const unpaid =
    members.filter(
      member => member.status === "Unpaid"
    ).length;


  document.getElementById("paidMembers")
    .innerText = paid;

  document.getElementById("unpaidMembers")
    .innerText = unpaid;

}
window.updateStats = updateStats;


function searchMember(){

  const input =
    document.getElementById("search")
      .value
      .toLowerCase();


  const items =
    document.querySelectorAll("#memberList tr");


  items.forEach((item) => {

    const text =
      item.textContent.toLowerCase();


    if(text.includes(input)){
      item.style.display = "flex";
    }

    else{
      item.style.display = "flex";
    }

  });

}
window.searchMember = searchMember;


function showSection(section){

  const dashboard =
    document.getElementById("dashboardSection");

  const members =
    document.getElementById("membersSection");


  dashboard.style.display = "none";
  members.style.display = "none";


  if(section === "dashboard"){

    dashboard.style.display = "block";

  }

  if(section === "members"){

    members.style.display = "block";

  }

}
window.showSection = showSection;
function showMemberInfo(member){
  
  

  document.getElementById("memberName")
    .innerText =
    member.name;
    document.getElementById(
  "memberId"
).innerText =
  "Member ID: EQB-" +
  (member.id || member.docId);
   
  document.getElementById(
  "totalPayments"
).innerText =
  member.payments
    ? member.payments.length
    : 0;

document.getElementById(
  "currentDebt"
).innerText =
  member.debt || 0;

document.getElementById(
  "receiptCount"
).innerText =
  receipts.filter(
    r => r.member === member.name
  ).length;

document.getElementById(
  "accountStatus"
).innerText =
  member.status; 
  document.getElementById(
    "equbDayCard"
  ).innerHTML = `
    <div class="day-card">

    <h2>
      🟢 Current Equb Day
    </h2>

    <div class="day-number">
      ${currentEqubDay} / 41
    </div>

  </div>
`;


if((member.debt || 0) === 0){

  document.getElementById(
    "debtCard"
  ).innerHTML = `
    <div class="day-card">

      <h2>
        ✅ No Debt
      </h2>

      <div class="day-number">
        0 ETB
      </div>

    </div>
  `;

}else{

  document.getElementById(
    "debtCard"
  ).innerHTML = `
    <div class="debt-card">

      <h2>
        💰 Current Debt
      </h2>

      <div class="day-number">
        ${member.debt} ETB
      </div>

    </div>
  `;
  }
   if((member.debt || 0) === 0){

  document.getElementById(
    "notificationCard"
  ).innerHTML = `
    <div class="notification-card">

      <h3>
        🔔 Notification
      </h3>

      <p>
        Your account is up to date.
      </p>

    </div>
  `;

}else{

  document.getElementById(
    "notificationCard"
  ).innerHTML = `
    <div class="notification-card">

      <h3>
        🔔 Notification
      </h3>

      <p>
        You have a debt of
        ${member.debt} ETB.
        Please complete your payment.
      </p>

    </div>
  `;
}

  document.getElementById("memberImage")
    .src =
   member.image ||
   "https://via.placeholder.com/100";

   const memberReceiptList =
    document.getElementById("memberReceiptList");

  memberReceiptList.innerHTML = "";
receipts.forEach((receipt) => {

  if(receipt.member === member.name){

    const li =
      document.createElement("li");

    li.innerHTML = `
      <div class="receipt-card">

        <h4>
          🧾 Receipt #${receipt.id}
        </h4>

        <p>
          💰 Amount:
          ${receipt.amount} ETB
        </p>

        <p>
          ✅ Status:
          ${receipt.status}
        </p>

        <p>
          📅 Date:
          ${receipt.date}
        </p>

      </div>
    `;

    memberReceiptList.appendChild(li);

  }

});
}
window.showMemberInfo = showMemberInfo;


function downloadPDF(){

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();


  doc.setFontSize(20);

  doc.text("Serbo Equb Report",20,20);


  let y = 40;


  members.forEach((member,index) => {

    doc.text(
      `${index + 1}. ${member.name} - ${member.amount} ETB - ${member.status}`,
      20,
      y
    );

    y += 10;

  });


  doc.save("Serbo-Equb-Report.pdf");

}


window.onload = function(){

  loadApp();
}


async function changeProfilePicture(){

  const file =
    document.getElementById(
      "memberProfileInput"
    ).files[0];

  if(!file){
    alert("Select image first");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function(e){

    const username =
      document.getElementById(
        "memberName"
      ).innerText;

    const member =
      members.find(
        m => m.name === username
      );

    if(member){

      member.image = e.target.result;

      const snapshot = await getDocs(
        collection(db, "members")
      );

      let firebaseDocId = null;

      snapshot.forEach((d) => {

        const data = d.data();

        if(data.id === member.id){
          firebaseDocId = d.id;
        }

      });

      if(firebaseDocId){

        await updateDoc(
          doc(db, "members", firebaseDocId),
          {
            image: member.image
          }
        );

      }

      saveData();

      showMemberInfo(member);

      loadApp();

      alert("Profile updated");

    }

  };

  reader.readAsDataURL(file);

}

window.changeProfilePicture = changeProfilePicture;

function editImage(index){

  const input =
    document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.onchange = function(){

    const file =
      input.files[0];

    const reader =
      new FileReader();

    reader.onload = function(e){

      members[index].image =
        e.target.result;

      saveData();

      loadApp();

      alert("Image updated");

    };

    reader.readAsDataURL(file);

  };

  input.click();

}
window.editImage = editImage;

async function filterMembers(){

  const selected =
    document.getElementById(
      "groupFilter"
    ).value;

  const rows =
    document.querySelectorAll(
      "#memberList tr"
    );

  rows.forEach((row) => {

    const amount =
      row.children[3]
      .innerText
      .replace(" ETB","");

    if(
      selected === "all" ||
      amount === selected
    ){

      row.style.display = "";

    }

    else{

      row.style.display = "none";

    }

  });

}
function nextPage(){

  const totalPages =
    Math.ceil(
      members.length /
      membersPerPage
    );

  if(currentPage < totalPages){

    currentPage++;

    loadApp();

  }

}
window.nextPage = nextPage;

function prevPage(){

  if(currentPage > 1){

    currentPage--;

    loadApp();

  }

}
window.prevPage = prevPage;

async function quickPay(index){
const member =
    members[index];
    


  

  const month =
    prompt("Enter Month");

  if(!month){
    return;
  }

  
    alert("Paying: " + member.name);
  if(!member.payments){

  member.payments = [];

}

  
  member.payments.push({

    amount: member.amount,

    month: month,

    date:
      new Date()
      .toLocaleDateString()

  });
const qMember = members[index];

const snapshot = await getDocs(
  collection(db, "members")
);

let firebaseDocId = null;

snapshot.forEach((doc) => {
  const data = doc.data();

 console.log("Local:", qMember.id);
  console.log("Firebase:", data.id);
  console.log("Match:", data.id === qMember.id); 
  

  if(data.id === qMember.id){
    firebaseDocId = doc.id;
  }
});

if(firebaseDocId){
 
 
  member.debt =
Math.max(
  0,
  Number(member.debt) -
  Number(member.amount)
);


await updateDoc(
  doc(db, "members", firebaseDocId),
  {
    debt: member.debt,
    payments: member.payments
  }
);
const checkSnap = await getDocs(
  collection(db, "members")
);

checkSnap.forEach((d) => {
  
});

}

  
  receipts.push({

  id: Date.now(),

  member: member.name,

  amount: member.amount,

  status: "Paid",

  date: new Date().toLocaleDateString()

});
  
  
  saveData();

  loadApp();

  alert("Payment Recorded");

}
window.quickPay = quickPay;

function viewPayments(memberId){

  const member =
    members.find(
      m => m.id === memberId
    );

  if(
    !member ||
    !member.payments ||
    member.payments.length === 0
  ){
    alert("No payments found");
    return;
  }

  let message = "";

  member.payments.forEach((payment) => {

    message +=
      payment.month +
      " - " +
      payment.amount +
      " ETB\n";

  });

  alert(message);

}

async function startNewDay() {

  currentEqubDay++;

  if (currentEqubDay > 41) {
    currentEqubDay = 0;
  }

  await setDoc(
    doc(db, "settings", "equb"),
    {
      currentEqubDay: currentEqubDay
    }
  );

  const snapshot = await getDocs(
    collection(db, "members")
  );

  members.forEach((member) => {
    member.debt =
      Number(member.debt || 0) +
      Number(member.amount);
  });

  for (const firebaseDoc of snapshot.docs) {

    const data = firebaseDoc.data();

    const localMember =
      members.find(
        m => String(m.id) === String(data.id)
      );

    if (localMember) {

      await updateDoc(
        doc(db, "members", firebaseDoc.id),
        {
          debt: localMember.debt
        }
      );

    }

  }

  saveData();

  loadApp();

  alert("New Equb Day Started");

}
window.onload = async function() {

  await loadEqubDay();

  loadApp();

};

function showHome(){

  const card =
    document.getElementById("equbDayCard");

  if(card){
    card.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });
  }

}

function showPayments(){
  document
    .getElementById("paymentSection")
    .scrollIntoView({
      behavior:"smooth"
    });
}

function showReceipts(){

  const receiptTitle =
    document.querySelector(
      "#memberReceiptList"
    );

  receiptTitle.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}



function setActiveMenu(button){

  document
    .querySelectorAll(".bottom-menu button")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  button.classList.add("active");

}
window.setActiveMenu = setActiveMenu;

function showProfile(){

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

  document
    .querySelectorAll(".bottom-menu button")[3]
    .classList.add("active");

}


window.addMember = addMember;
window.showSection = showSection;
window.startNewDay = startNewDay;
window.quickPay = quickPay;
window.viewPayments = viewPayments;
window.showHome = showHome;
window.showPayments = showPayments;
window.showReceipts = showReceipts;
window.showProfile = showProfile;
