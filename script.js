
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
  deleteDoc,
  serverTimestamp
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

    showerror("Wrong Admin Login");

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

            showWarning("Waiting for Admin Approval");
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

    showError(error);

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
    showerror("Passwords do not match");
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

showSuccess("Registration submitted. Please wait for Admin approval.");  

    showSuccess("Account created successfully");

  }catch(error){

    showError(error);

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
    showWarning("Please fill all fields");
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

    refreshApp();
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

function renderDashboard() {

    document.getElementById("totalMembers").innerText =
        members.length;

    let totalMoney = 0;

    members.forEach(member => {
        totalMoney += Number(member.amount || 0);
    });

    document.getElementById("totalMoney").innerText =
        totalMoney + " ETB";

}

function renderGroupStats(){

    const groupStats =
        document.getElementById("groupStats");

    if(!groupStats) return;

    const groups = {};

    members.forEach((member)=>{

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


function renderReceipts(){

    const receiptList =
        document.getElementById("receiptList");

    if(!receiptList) return;

    receiptList.innerHTML = "";

    receipts.forEach((receipt)=>{

        const li = document.createElement("li");

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


function renderMembers(){

    const memberList =
        document.getElementById("memberList");

    if(!memberList) return;

    memberList.innerHTML = "";

    const start =
        (currentPage - 1) * membersPerPage;

    const end =
        start + membersPerPage;

    members
        .slice(start,end)
        .forEach((member,index)=>{

            const realIndex = start + index;

            const row =
                document.createElement("tr");

            row.innerHTML = `

<td>
<img
src="${member.image}"
width="50"
height="50"
style="border-radius:50%;">
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

}

async function loadApp(){

  await loadMembersFromFirebase();
  await loadReceiptsFromFirebase();

  const receiptList =
  document.getElementById("receiptList");
  const memberList =
    document.getElementById("memberList");
  
  const paymentMember =
  document.getElementById(
    "paymentMember"
  );



  memberList.innerHTML = "";

  const paymentHistory =
  document.getElementById(
    "paymentHistory"
  );

if(paymentHistory){
  paymentHistory.innerHTML = "";
}

const start =
  (currentPage - 1) *
  membersPerPage;

const end =
  start +
  membersPerPage;
if(paymentMember){
  paymentMember.innerHTML = "";

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
renderDashboard();

renderMembers();

renderReceipts();

renderGroupStats();
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

  refreshApp();

  showWarning("Member deleted successfully");

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


function searchMember() {

    const input = document
        .getElementById("search")
        .value
        .trim()
        .toLowerCase();

    const rows =
        document.querySelectorAll("#memberList tr");

    rows.forEach((row) => {

        const name =
            row.children[1]
            .innerText
            .trim()
            .toLowerCase();

        if (
            input === "" ||
            name.startsWith(input)
        ) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}

window.searchMember = searchMember;
function showSection(section){

   document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("membersSection").style.display = "none";
  document.getElementById("receiptsPage").style.display = "none";
  document.getElementById("pendingMembersPage").style.display = "none";
document.getElementById("pendingPaymentsPage")
        .style.display = "none";
  

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
   
  document.getElementById("totalPayments").innerText =
  receipts.filter(
    r => r.memberId === member.docId
  ).length;

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

updateNotificationBadge(member.docId);
}
window.showMemberInfo = showMemberInfo;





window.onload = function(){

  loadApp();
}




async function changeProfilePicture() {

  const file =
    document.getElementById("memberProfileInput").files[0];

  if (!file) {
    showerror("Select image first");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const member = window.currentMember;

    if (!member) {
      showerror("Member not found.");
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

      showSuccess("Profile picture updated successfully.");

    } catch(error){

    showError(error);

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

      showSuccess("Image updated");

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
window.filterMembers = filterMembers;
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

  showSuccess("Payment Recorded");

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
    showerror("No payments found");
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

  
loadMembersFromFirebase();
 loadApp();

  showSuccess("New Equb Day Started");

}
window.onload = async function(){
    

  await loadEqubDay();

  loadApp();

}

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

function showpayments(){
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

  showSuccess("Debt updated successfully");

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

  showInfo("Profile Updated");

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
    document.getElementById("pendingPaymentsPage")
        .style.display = "none";

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

    showSuccess("Member Approved");

}

window.approveMember = approveMember;

async function rejectMember(id){

    await deleteDoc(
        doc(db,"pendingMembers",id)
    );

    showWarning("Member Rejected");

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

        showSuccess("Password reset link sent.");

    }catch(error){

    showError(error);

}
   
}


function openPendingPayments(){

    document.getElementById("dashboardSection")
        .style.display = "none";
     document.getElementById("membersSection").style.display="none";
    document.getElementById("receiptsPage").style.display="none";   

    document.getElementById("pendingPaymentsPage")
        .style.display = "block";

    loadPendingPayments();

}

window.openPendingPayments = openPendingPayments;

async function submitPayment() {

  const method = document.getElementById("paymentMethod").value;

  const file = document.getElementById("paymentReceipt").files[0];

  if (!method) {
    showWarning("Please select payment method.");
    return;
  }

  if (!file) {
    showerror("Please upload payment receipt");
    return;
  }



  const reader = new FileReader();

  reader.onload = async function(e) {

    const memberName =
      document.getElementById("memberName").innerText;

    const member =
      members.find(m => m.name === memberName);
    

    if (!member) {
      showerror("Member not found.");
      return;
    }

    
  const amount =
      Number(
       document.getElementById("paymentAmount").value
     );  
    if(amount <= 0){

    showWarning("Enter valid amount.");
    return;

}

if(amount > member.debt){

    showerror("Amount cannot be greater than your debt.");

    return;

}

    await addDoc(
      collection(db, "paymentRequests"),
      {

        memberId: member.docId,

        memberName: member.name,

       amount: amount,

        method: method,

        receipt: e.target.result,

        status: "Pending",

        createdAt: new Date()

      }
    );

    showSuccessModal(
    "Payment Submitted",
    "Your payment request has been sent successfully. Waiting for Admin Approval."
);

   setTimeout(() => {
    closePaymentModal();
}, 500);

  };

  reader.readAsDataURL(file);

}

window.submitPayment = submitPayment;

function backToAdminDashboard(){

    document.getElementById("pendingPaymentsPage")
        .style.display = "none";

    document.getElementById("dashboardSection")
        .style.display = "block";
    
    

}


window.backToAdminDashboard = backToAdminDashboard;

async function loadPendingPayments(){

    const list =
        document.getElementById("pendingPaymentsList");

    list.innerHTML = "";

    const snapshot =
        await getDocs(collection(db,"paymentRequests"));

    snapshot.forEach((paymentDoc)=>{

        const payment = paymentDoc.data();

        if(payment.status !== "Pending") return;

        list.innerHTML += `

        <div class="payment-card">

            <h3>${payment.memberName}</h3>

            <p>
                Amount:
                ${payment.amount} ETB
            </p>

            <p>
                Method:
                ${payment.method}
            </p>

            <button
            onclick="viewReceipt('${payment.receipt}')">

            👁 View Receipt

            </button>

            <button
            onclick="approvePayment('${paymentDoc.id}')">

            ✅ Approve

            </button>

            <button
            onclick="rejectPayment('${paymentDoc.id}')">

            ❌ Reject

            </button>

        </div>

        `;

    });

}

window.loadPendingPayments = loadPendingPayments;


async function approvePayment(requestId) {

  try {

    // 1. Get payment request
    const requestRef = doc(db, "paymentRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      showWarning("Payment request not found");
      return;
    }

    const request = requestSnap.data();

    // 2. Get member
    const memberRef = doc(db, "members", request.memberId);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      showerror("Member not found");
      return;
    }

    const member = memberSnap.data();

    // 3. Update debt
    const newDebt = Math.max(
      0,
      (member.debt || 0) - Number(request.amount)
    );

    // 4. Update member
    await updateDoc(memberRef, {
      debt: newDebt
    });

    // 5. Save receipt
    await addDoc(collection(db, "receipts"), {

      id: Date.now(),
      
      member: request.memberName,
      memberId: request.memberId,

      amount: request.amount,

      method: request.method,

      receipt: request.receipt,

      status: "Approved",

      date: new Date().toLocaleDateString(),

      createdAt: serverTimestamp()

    });

    await addDoc(collection(db, "notifications"), {

  memberId: request.memberId,

  title: "Payment Approved",

  message: `Your payment of ${request.amount} ETB has been approved.`,

  amount: request.amount,

  status: "unread",

  createdAt: serverTimestamp()

});

// Delete pending payment
await deleteDoc(requestRef);

// 🔥 Reload receipts from Firebase
await loadReceiptsFromFirebase();

// 🔥 Reload members
await loadMembersFromFirebase();

// 🔥 Reload pending payments
await loadPendingPayments();

// 🔥 Refresh UI
refreshApp();

showSuccess("Payment Approved Successfully");
  } catch(error){

    showError(error);

}

}

window.approvePayment = approvePayment;

async function loadNotifications(memberId){

    const list =
        document.getElementById("notificationList");

    list.innerHTML = "";

    const snapshot =
        await getDocs(collection(db,"notifications"));

    snapshot.forEach(doc=>{

        const notification = doc.data();

        if(notification.memberId !== memberId) return;

        list.innerHTML += `

<div class="notification-card">

    <h3>${notification.title}</h3>

    <p>${notification.message}</p>

    <small>
        ${notification.amount || ""} ETB
    </small>

    <br>

    <small>
        ${notification.createdAt
            ? notification.createdAt.toDate().toLocaleString()
            : ""}
    </small>

</div>

`;

    });

}

async function openNotifications() {

    document.getElementById("memberDashboard").style.display = "none";
    document.getElementById("notificationsPage").style.display = "block";

    const memberName =
        document.getElementById("memberName").innerText;

    const member =
        members.find(m => m.name === memberName);

    if(!member){
        return;
    }

    loadNotifications(member.docId);

    const snapshot =
        await getDocs(collection(db,"notifications"));

    snapshot.forEach(async (docSnap) => {

        const notification = docSnap.data();

        if(
            notification.memberId === member.docId &&
            notification.status === "unread"
        ){

            await updateDoc(
                doc(db,"notifications",docSnap.id),
                {
                    status:"read"
                }
            );

        }

    });

    updateNotificationBadge(member.docId);

}

window.openNotifications = openNotifications;
function backToMemberDashboard(){

    document.getElementById("notificationsPage").style.display = "none";

    document.getElementById("memberDashboard").style.display = "block";

}

window.backToMemberDashboard = backToMemberDashboard;

async function updateNotificationBadge(memberId){

    let unread = 0;

    const snapshot =
        await getDocs(collection(db,"notifications"));

    snapshot.forEach(doc=>{

        const notification = doc.data();

        if(
            notification.memberId === memberId &&
            notification.status === "unread"
        ){
            unread++;
        }

    });

    const badge =
        document.getElementById("notificationBadge");

    if(unread > 0){

        badge.style.display = "inline-block";

        badge.innerText = unread;

    }else{

        badge.style.display = "none";

    }

}

window.updateNotificationBadge = updateNotificationBadge;

function viewReceipt(image){

    document.getElementById("receiptImage").src = image;

    document.getElementById("receiptModal").style.display = "flex";

}

window.viewReceipt = viewReceipt;

function closeReceiptModal(){

    document.getElementById("receiptModal").style.display = "none";

}

window.closeReceiptModal = closeReceiptModal;

async function rejectPayment(requestId){

    if(!confirm("Reject this payment?")) return;

    try{

        await deleteDoc(
            doc(db,"paymentRequests",requestId)
        );

        showWarning("Payment Rejected");

        loadPendingPayments();

      }catch(error){

    showError(error);

}

}

window.rejectPayment = rejectPayment;

function showPayments(){

    document.getElementById("memberDashboard").style.display = "none";

    document.getElementById("memberReceiptSection").style.display = "none";

    document.getElementById("notificationsPage").style.display = "none";

    document.getElementById("paymentPage").style.display = "block";

    const memberName =
        document.getElementById("memberName").innerText;

    const member =
        members.find(m => m.name === memberName);

    if(member){

        document.getElementById("paymentDebt").innerText =
            member.debt + " ETB";

    }

}
window.showPayments = showPayments;

function openPaymentPage(){

    document.getElementById("memberDashboard").style.display = "none";

    document.getElementById("paymentPage").style.display = "block";

}

function BackToMemberDashboard() {

    document.getElementById("paymentPage").style.display = "none";

    document.getElementById("memberDashboard").style.display = "block";

}
window.BackToMemberDashboard = BackToMemberDashboard;


function showLoading(){
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading(){
    document.getElementById("loadingOverlay").style.display = "none";
}


function checkInternet(){

    const banner = document.getElementById("offlineBanner");

    if(navigator.onLine){

        banner.style.display = "none";

    }else{

        banner.style.display = "block";

    }

}

window.addEventListener("online", checkInternet);
window.addEventListener("offline", checkInternet);

checkInternet();


function showError(error){

    console.error(error);

    let message = "Something went wrong.";

    switch(error.code){

        case "auth/network-request-failed":
            message = "No Internet Connection.";
            break;

        case "auth/user-not-found":
            message = "Account not found.";
            break;

        case "auth/wrong-password":
            message = "Wrong password.";
            break;

        case "auth/invalid-email":
            message = "Invalid email.";
            break;

        case "permission-denied":
            message = "Permission denied.";
            break;

        default:
            message = error.message;
    }

    alert(message);

}


async function refreshApp(){

    showLoading();

    await loadEqubDay();

    await loadMembersFromFirebase();

    await loadReceiptsFromFirebase();

    loadApp();

    hideLoading();

}

function searchReceipt(){

    const input =
        document.getElementById("receiptSearch")
        .value
        .toLowerCase();

    const rows =
        document.querySelectorAll("#receiptTable tr");

    rows.forEach((row)=>{

        const text =
            row.textContent.toLowerCase();

        if(text.includes(input)){
            row.style.display = "";
        }else{
            row.style.display = "none";
        }

    });

}

window.searchReceipt = searchReceipt;


function showToast(message,type="success"){

    const container =
    document.getElementById("toastContainer");

    const toast =
    document.createElement("div");

    toast.className =
    "toast " + type;

    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(()=>{
        toast.remove();
    },3000);

}

function showSuccess(msg){
    showToast("✅ " + msg,"success");
}

function showerror(msg){
    showToast("❌ " + msg,"error");
}

function showWarning(msg){
    showToast("⚠️ " + msg,"warning");
}

function showInfo(msg){
    showToast("ℹ️ " + msg,"info");
}


function showSuccessModal(title,message){

    document.getElementById("successTitle").innerText =
    title;

    document.getElementById("successText").innerText =
    message;

    document.getElementById("successModal").style.display =
    "flex";

}

function closeSuccessModal(){

    document.getElementById("successModal").style.display =
    "none";
closePaymentModal();

}
window.closeSuccessModal = closeSuccessModal;


function closePaymentModal(){

    document.getElementById("paymentPage").style.display = "none";

    // Clear payment form
    document.getElementById("paymentMethod").selectedIndex = 0;
    document.getElementById("paymentAmount").value = "";
    document.getElementById("paymentReceipt").value = "";

  document.getElementById("memberDashboard").style.display = "block";

    
}

window.closePaymentModal = closePaymentModal;


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
