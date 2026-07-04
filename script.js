
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

  let editingMemberIndex = null;
  let editingPasswordIndex = null;




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

  await loadReceiptsFromFirebase();
    

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
import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

async function loadReceiptsFromFirebase(){

  receipts = [];

  const snapshot =
    await getDocs(
      collection(db, "receipts")
    );

  snapshot.forEach((doc) => {
    const receipt = doc.data();

if (receipt.equbDay === undefined) {
  receipt.equbDay = 0;
}

receipts.push(receipt);
  });

}
window.onload = async function(){

  await loadReceiptsFromFirebase();


  loadApp();

}

 
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
  if(role === "admin"){

  const adminDoc = await getDoc(
    doc(db, "settings", "admin")
  );

  const adminData = adminDoc.data();

  if(
    username === adminData.username &&
    password === adminData.password
  ){

    document.getElementById("loginPage")
      .style.display = "none";

    document.getElementById("memberDashboard")
      .style.display = "none";

    document.getElementById("app")
      .style.display = "flex";

    loadApp();

    showSection("dashboard");

  }else{

    alert("Wrong Admin Login");

  }

}


  // MEMBER LOGIN
 // MEMBER LOGIN
else if(role === "member"){

    try{

        const snapshot = await getDocs(collection(db,"members"));

        let member = null;

        snapshot.forEach((docSnap)=>{

            const data = docSnap.data();

            if(data.phone === username){

                member = {
                    ...data,
                    docId: docSnap.id
                };

            }

        });

        if(!member){

            alert("Your account is waiting for Admin approval.");
            return;

        }

        await signInWithEmailAndPassword(
            auth,
            member.email,
            password
        );

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "none";
        document.getElementById("memberDashboard").style.display = "block";
        document.getElementById("memberReceiptSection").style.display = "none";

        showMemberInfo(member);

    }catch(error){

        console.log(error.code);
        console.log(error.message);

        alert("Wrong phone number or password.");

    }

}
}
window.login = login;

function showSignup(){

  document.getElementById("loginPage").style.display = "none";

  document.getElementById("signupSection").style.display = "block";

}

window.showSignup = showSignup;

async function signupMember(){

  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const address = document.getElementById("signupAddress").value;
  const equb = document.getElementById("signupEqubType").value;
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirmPassword").value;

  if(password !== confirm){
    alert("Passwords do not match");
    return;
  }

  const email =
document.getElementById("signupEmail").value.trim();
  try{

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await addDoc(
  collection(db, "pendingMembers"),
  {
    uid: userCredential.user.uid,
    email: email,
    name: name,
    phone: phone,
    address: address,
    amount: Number(equb),
    password: password,
    status: "Pending",
    image: "https://via.placeholder.com/60",
    createdAt: new Date()
  }
);

alert("Registration submitted. Please wait for Admin approval.");  

    alert("Account created successfully");

  }catch(error){

    alert(error.message);

  }

}
window.signupMember = signupMember;

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
  date: new Date().toLocaleDateString(),
  equbDay: currentEqubDay
  };

receipts.push(receipt);

await addDoc(
  collection(db, "receipts"),
  receipt
);

notifications.push(
  `${name}: Status is ${status}. Amount: ${amount} ETB`
);

  saveData();

  loadApp();


  document.getElementById("name").value = "";

  document.getElementById("amount").value = "";

}


async function loadApp(){

  await loadMembersFromFirebase();

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

   totalMoney += Number(member.amount || 0); 


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

<td>
  <button onclick="quickPay(${realIndex})">
  Pay
</button>

<button onclick="viewPayments('${member.docId}')">
  History
</button>
</button>
  <button onclick="editMemberProfile(${realIndex})">
  Profile
</button>



  <button onclick="editImage(${realIndex})">
    Image
  </button>
  
  <button onclick="editDebt(${realIndex})">
    Debt
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


async function deleteMember(index){

  if(!confirm("Delete this member?")){
    return;
  }

  const member = members[index];

  await deleteDoc(
    doc(db, "members", member.docId)
  );

  await loadMembersFromFirebase();

  loadApp();

  alert("Member deleted successfully");

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

   document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("membersSection").style.display = "none";
  document.getElementById("receiptsPage").style.display = "none";
  document.getElementById("pendingMembersPage").style.display = "none";

  

  if(section === "dashboard"){
    document.getElementById("dashboardSection").style.display = "block";
  }

  if(section === "members"){
    document.getElementById("membersSection").style.display = "block";
  }

  if(section === "receiptsPage"){
    document.getElementById("receiptsPage").style.display = "block";
    loadReceiptsPage();
}

}
window.showSection = showSection;
async function showMemberInfo(member){
  window.currentMember = member;
  
  const memberDoc = await getDoc(
  doc(db, "members", member.docId)
);

if (memberDoc.exists()) {
  member = {
    ...memberDoc.data(),
    docId: member.docId
  };
}

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
  r =>
    r.member.toLowerCase() ===
    member.name.toLowerCase()
).length

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

// Member receipts only
const memberReceipts = receipts.filter(
  receipt =>
    receipt.member.toLowerCase() ===
    member.name.toLowerCase()
);

// Newest first
memberReceipts.reverse();

// Show only latest 10
const lastTenReceipts = memberReceipts.slice(0, 10);

lastTenReceipts.forEach((receipt) => {

  const li = document.createElement("li");

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




async function changeProfilePicture() {

  const file =
    document.getElementById("memberProfileInput").files[0];

  if (!file) {
    alert("Select image first");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const member = window.currentMember;

    if (!member) {
      alert("Member not found.");
      return;
    }

    const image = e.target.result;

    try {

      await updateDoc(
        doc(db, "members", member.docId),
        {
          image: image
        }
      );

      member.image = image;

      await loadMembersFromFirebase();

      const updatedMember =
        members.find(
          m => m.docId === member.docId
        );

      showMemberInfo(updatedMember);

      loadApp();

      alert("Profile picture updated successfully.");

    } catch (error) {

      console.error(error);

      alert("Failed to update profile picture.");

    }

  };

  reader.readAsDataURL(file);

}

window.changeProfilePicture = changeProfilePicture;

async function editImage(index){

  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = async function(){

    const file = input.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = async function(e){

      const imageData = e.target.result;

      members[index].image = imageData;

      await updateDoc(
        doc(db, "members", members[index].docId),
        {
          image: imageData
        }
      );

      await loadMembersFromFirebase();

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

  

 const receipt = {
  id: Date.now(),
  member: member.name,
  memberId: member.docId,
  amount: Number(member.amount),
  status: "Paid",
  month: month,
  date: new Date().toLocaleDateString(),
  equbDay: currentEqubDay
}; 

  

const qMember = members[index];

const memberSnap = await getDoc(
  doc(db, "members", qMember.docId)
);

const latestMember = memberSnap.data();

member.payments = latestMember.payments || [];

member.payments.push({
    amount: member.amount,
    month: month,
    date: new Date().toLocaleDateString()
});

const firebaseDocId = qMember.docId;

member.debt = Math.max(
  0,
  Number(member.debt || 0) -
  Number(member.amount || 0)
);

member.status = member.debt === 0
  ? "Paid"
  : "Unpaid";

await updateDoc(
  doc(db, "members", firebaseDocId),
  {
    debt: member.debt,
    payments: member.payments,
    status: member.status
  }
);

const checkSnap = await getDocs(
  collection(db, "members")
);

checkSnap.forEach((d) => {
  
});

receipts.push(receipt);

await addDoc(
  collection(db, "receipts"),
  receipt
);

await loadReceiptsFromFirebase();
await loadMembersFromFirebase();
  loadApp();

  alert("Payment Recorded");

}
window.quickPay = quickPay;

function viewPayments(docId) {

  const member = members.find(
    m => m.docId === docId
  );

  if (
    !member ||
    !member.payments ||
    member.payments.length === 0
  ) {
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

  

  for (const member of members) {

  member.debt =
    Number(member.debt || 0) +
    Number(member.amount || 0);

  await updateDoc(
    doc(db, "members", member.docId),
    {
      debt: member.debt
    }
  );

}

  saveData();

  await loadMembersFromFirebase();

  loadApp();

  alert("New Equb Day Started");

}
window.onload = async function() {

  await loadEqubDay();

  loadApp();

};

function showHome(){

  // Hide receipt page
  document.getElementById("memberReceiptSection").style.display = "none";

  // Go back to dashboard
  const card = document.getElementById("equbDayCard");

  if(card){
    card.scrollIntoView({
      behavior:"smooth",
      block:"center"
    });
  }

}

window.showHome = showHome;

function showPayments(){
  document
    .getElementById("paymentSection")
    .scrollIntoView({
      behavior:"smooth"
    });
}

function showReceipts(){

  const receiptSection =
    document.getElementById("memberReceiptSection");

  receiptSection.style.display = "block";

  receiptSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}

window.showReceipts = showReceipts;
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

  // Hide receipts
  document.getElementById("memberReceiptSection").style.display = "none";

  // Profile section
  const profile =
    document.getElementById("memberProfile");

  if(profile){
    profile.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });
  }

}

window.showProfile = showProfile;

async function editDebt(index){

  const member = members[index];

  const newDebt = prompt(
    `Enter new debt for ${member.name}`,
    member.debt || 0
  );

  if(newDebt === null) return;

  member.debt = Number(newDebt);

  if(member.docId){

    await updateDoc(
      doc(db, "members", member.docId),
      {
        debt: member.debt
      }
    );

   

  }

  saveData();

  loadApp();

  alert("Debt updated successfully");

}
window.editDebt = editDebt;


function editMemberProfile(index){

  editingMemberIndex = index;

  const member = members[index];

  document.getElementById(
    "editName"
  ).value = member.name;

  document.getElementById(
    "editPhone"
  ).value = member.phone;

  document.getElementById(
    "editAmount"
  ).value = member.amount;

  document.getElementById(
    "editStatus"
  ).value = member.status;

  document.getElementById(
    "editMemberModal"
  ).style.display = "flex";

}

async function saveMemberEdit(){

  const member =
    members[editingMemberIndex];

  member.name =
    document.getElementById(
      "editName"
    ).value;

  member.phone =
    document.getElementById(
      "editPhone"
    ).value;

  member.amount =
    document.getElementById(
      "editAmount"
    ).value;

  member.status =
    document.getElementById(
      "editStatus"
    ).value;

  await updateDoc(
    doc(
      db,
      "members",
      member.docId
    ),
    {
      name: member.name,
      phone: member.phone,
      amount: member.amount,
      status: member.status
    }
  );

  saveData();

  loadApp();

  closeEditModal();

  alert("Member Updated");

}

function closeEditModal(){

  document.getElementById(
    "editMemberModal"
  ).style.display = "none";

}

window.editMemberProfile =
  editMemberProfile;

window.saveMemberEdit =
  saveMemberEdit;

window.closeEditModal =
  closeEditModal;

function loadReceiptsPage() {

  const table =
    document.getElementById("receiptTable");

  table.innerHTML = "";

  receipts.forEach((receipt, index) => {


    table.innerHTML += `
      <tr>
        <td>${receipt.id}</td>
        <td>${receipt.member}</td>
        <td>${receipt.amount} ETB</td>
        <td>${receipt.date}</td>
        <td>
          <button onclick="deleteReceipt(${index})">
            Delete
          </button>
        </td>
      </tr>
    `;

  });

}

async function deleteReceipt(index){

  if(!confirm("Delete this receipt?")) return;

  const receipt = receipts[index];

  // Firestore receipt find
  const snapshot = await getDocs(
    collection(db, "receipts")
  );

  snapshot.forEach(async (firebaseDoc)=>{

    const data = firebaseDoc.data();

    if(
      data.id == receipt.id
    ){

      await deleteDoc(
        doc(db,"receipts",firebaseDoc.id)
      );

    }

  });

  await loadReceiptsFromFirebase();

  loadReceiptsPage();

}
window.deleteReceipt = deleteReceipt;

function showPendingMembers(){

    document.getElementById("dashboardSection").style.display="none";
    document.getElementById("membersSection").style.display="none";
    document.getElementById("receiptsPage").style.display="none";

    document.getElementById("pendingMembersPage").style.display="block";

    loadPendingMembers();

}
window.showPendingMembers = showPendingMembers;


async function loadPendingMembers(){

    const container =
    document.getElementById("pendingMembersList");

    container.innerHTML="";

    const snapshot = await getDocs(
        collection(db,"pendingMembers")
    );

    snapshot.forEach((memberDoc)=>{

        const member = memberDoc.data();

        container.innerHTML += `

        <div class="pending-card">

            <h3>${member.name}</h3>

            <p>📞 ${member.phone}</p>

            <p>🏠 ${member.address}</p>

            <p>💰 ${member.amount} ETB</p>

            <button onclick="approveMember('${memberDoc.id}')">
                ✅ Approve
            </button>

            <button onclick="rejectMember('${memberDoc.id}')">
                ❌ Reject
            </button>

        </div>

        `;

    });

}


async function approveMember(id){

    const pendingRef = doc(db, "pendingMembers", id);

    const pendingSnap = await getDoc(pendingRef);

    if(!pendingSnap.exists()) return;

    const pendingMember = pendingSnap.data();

    await setDoc(
        doc(db, "members", id),
        {
            uid: pendingMember.uid,
            email: pendingMember.email,
            name: pendingMember.name,
            phone: pendingMember.phone,
            address: pendingMember.address,
            amount: Number(pendingMember.amount || 0),
            debt: Number(pendingMember.amount || 0),
            image: pendingMember.image || "https://via.placeholder.com/60",
            password: pendingMember.password,
            
            status: "Active",
            payments: [],
            createdAt: pendingMember.createdAt
        }
    );

    await deleteDoc(pendingRef);

    await loadPendingMembers();
    await loadMembersFromFirebase();

    loadApp();

    alert("Member Approved");

}

window.approveMember = approveMember;

async function rejectMember(id){

    await deleteDoc(
        doc(db,"pendingMembers",id)
    );

    alert("Member Rejected");

    loadPendingMembers();

}
window.rejectMember = rejectMember;

async function forgotPassword(){

    const email =
    prompt("Enter your email");

    if(!email) return;

    try{

        await sendPasswordResetEmail(
            auth,
            email
        );

        alert("Password reset link sent.");

    }catch(error){

        console.log(error.code);
        console.log(error.message);
 
  }
   
}

window.forgotPassword = forgotPassword;
window.addMember = addMember;
window.showSection = showSection;
window.startNewDay = startNewDay;
window.quickPay = quickPay;
window.viewPayments = viewPayments;
window.showHome = showHome;
window.showPayments = showPayments;
window.showReceipts = showReceipts;
window.showProfile = showProfile;
