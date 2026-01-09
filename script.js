const GAS_URL = "https://script.google.com/macros/s/AKfycbxCkkOAdfxD1p_T89MHnxjRIBi13hqXx67b39hAQL086qz0XD8R0pt7JmbLr_Xfqu1z/exec";

const passwordEl = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const userEl = document.getElementById("user");
const userformEl = document.getElementById("userform");
const birthdayEl = document.getElementById("birthday");
const detailEl = document.getElementById("detail");
const departmentEl = document.getElementById("department");
const departmentOtherEl = document.getElementById("departmentOther");
const btnLoginEl = document.getElementById("btn-login");
const btnSubmitEl = document.getElementById("btn-submit");
const resultModalEl = document.getElementById("resultModal");
const modalLoadingEl = document.getElementById("modal-loading");
const modalSuccessEl = document.getElementById("modal-success");
const modalErrorEl = document.getElementById("modal-error");
const showBooknoEl = document.getElementById("show-bookno");
const dashTotalEl = document.getElementById("dash-total");
const dashTodayEl = document.getElementById("dash-today");
const dashOnlineEl = document.getElementById("dash-online");
const loginSpinnerEl = document.getElementById("loginSpinner");

// ------------------ Department Other ------------------
departmentEl.addEventListener("change", () => {
  if (departmentEl.value === "อื่นๆ") {
    departmentOtherEl.classList.remove("d-none");
  } else {
    departmentOtherEl.classList.add("d-none");
    departmentOtherEl.value = "";
    departmentOtherEl.classList.remove("is-invalid");
  }
});

// ------------------ Helper ------------------
function post(data){
  return fetch(GAS_URL,{
    method:"POST",
    body:new URLSearchParams(data)
  }).then(r=>r.json());
}

// ------------------ Login ------------------
function login(){
  const pass = passwordEl.value.trim();

  // ตรวจสอบรหัสว่าง
  if(!pass){
    passwordEl.classList.add("is-invalid");
    return;
  } else {
    passwordEl.classList.remove("is-invalid");
  }

  // แสดง Spinner ขณะ login
  loginSpinnerEl.classList.remove("d-none");

  post({action:"login", password:pass}).then(res=>{
    // ซ่อน Spinner หลัง login
    loginSpinnerEl.classList.add("d-none");

    if(res.length){
      // กำหนดค่าผู้ใช้
      userEl.value = res[0][1];

      // แสดงฟอร์มผู้ใช้
      userformEl.classList.remove("invisible");
      document.body.classList.add("has-userform");

      // **ซ่อนการ์ดสืบค้นหลัง login**
      document.querySelector(".search-card")?.classList.add("d-none");

      // เพิ่มผู้ใช้ออนไลน์
      post({action:"addOnline", name:res[0][1]});
    } else {
      // รหัสไม่ถูกต้อง
      passwordEl.classList.add("is-invalid");
      document.getElementById("password-feedback").innerText = "ข้อมูลไม่ถูกต้อง";
    }
  }).catch(()=>{
    loginSpinnerEl.classList.add("d-none");
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  });
}

// ------------------ Toggle Password ------------------
togglePassword.addEventListener("click", () => {
  const type = passwordEl.type === "password" ? "text" : "password";
  passwordEl.type = type;

  const icon = togglePassword.querySelector("i");
  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

// ------------------ Validate Form ------------------
function validateForm(){
  let valid = true;

  if(!birthdayEl.value){
    birthdayEl.classList.add("is-invalid");
    valid = false;
  } else {
    birthdayEl.classList.remove("is-invalid");
  }

  if(!detailEl.value.trim()){
    detailEl.classList.add("is-invalid");
    valid = false;
  } else {
    detailEl.classList.remove("is-invalid");
  }

  if(!departmentEl.value){
    departmentEl.classList.add("is-invalid");
    valid = false;
  } else {
    departmentEl.classList.remove("is-invalid");
  }

  if(departmentEl.value === "อื่นๆ"){
    if(!departmentOtherEl.value.trim()){
      departmentOtherEl.classList.add("is-invalid");
      valid = false;
    } else {
      departmentOtherEl.classList.remove("is-invalid");
    }
  }

  return valid;
}

// ------------------ Modal / Session ------------------
function showSessionExpiredAndReset(){
  const modal = new bootstrap.Modal(resultModalEl,{
    backdrop:'static',
    keyboard:false
  });

  modalLoadingEl.classList.add("d-none");
  modalSuccessEl.classList.add("d-none");
  modalErrorEl.classList.remove("d-none");

  modalErrorEl.querySelector("h5").innerText = "⏰ ใช้เวลาเกิน 5 นาที";
  modalErrorEl.querySelector("p").innerText = "กรุณาเข้าสู่ระบบใหม่";

  modalErrorEl.querySelector("button").onclick = () => {
    modal.hide();
    resetToLogin();
  };

  modal.show();
}

function modalLoading(){
  modalLoadingEl.classList.remove("d-none");
  modalSuccessEl.classList.add("d-none");
  modalErrorEl.classList.add("d-none");
}

function showSuccess(bookno){
  modalLoadingEl.classList.add("d-none");
  modalSuccessEl.classList.remove("d-none");
  showBooknoEl.innerText = `เลขคำสั่งโรงเรียน = ${bookno}`;
}

function showQueueError(){
  const modal = new bootstrap.Modal(resultModalEl);

  modalLoadingEl.classList.add("d-none");
  modalSuccessEl.classList.add("d-none");
  modalErrorEl.classList.remove("d-none");

  modalErrorEl.querySelector("h5").innerText = "กำจัดผู้ใช้งานครั้งละ 1 คน";
  modalErrorEl.querySelector("p").innerText = "กรุณารอ 5 นาที แล้วเข้าสู่ระบบใหม่";

  modalErrorEl.querySelector("button").onclick = () => {
    modal.hide();
    resetToLogin();
  };

  modal.show();
}

// ------------------ Reset ------------------
function resetToLogin(){
  birthdayEl.value = "";
  detailEl.value = "";
  departmentEl.value = "";
  departmentOtherEl.value = "";
  departmentOtherEl.classList.add("d-none");
  passwordEl.value = "";
  userformEl.classList.add("invisible");

  document.body.classList.remove("has-userform");

  if(userEl.value){
    post({action:"deleteOnline", name:userEl.value});
  }
  userEl.value = "";
}

// ------------------ Submit ------------------
function submitData(){
  if(!validateForm()) return;

  const departmentValue =
    departmentEl.value === "อื่นๆ"
      ? departmentOtherEl.value.trim()
      : departmentEl.value;

  const modal = new bootstrap.Modal(resultModalEl,{
    backdrop:'static',
    keyboard:false
  });

  modal.show();
  modalLoading();

  post({action:"checkOnline", name:userEl.value}).then(res=>{
    if(res.expired){
      modal.hide();
      showSessionExpiredAndReset();
      return;
    }

    post({
      action:"addRecord",
      birthday: birthdayEl.value,
      detail: detailEl.value,
      department: departmentValue,
      user: userEl.value
    }).then(res=>{
      if(res.error === "expired"){
        modal.hide();
        showSessionExpiredAndReset();
        return;
      }

      if(res.error === "queue"){
        modal.hide();
        showQueueError();
        return;
      }

      showSuccess(res.bookno);
      resetToLogin();
    });
  });
}

// ------------------ Dashboard ------------------
function loadDashboard(){
  post({action:"dashboard"}).then(d=>{
    dashTotalEl.innerText = d.total;
    dashTodayEl.innerText = d.today;
    dashOnlineEl.innerText = d.online;
  });
}

function checkSession(){
  if(!userEl.value) return;
  if(document.querySelector(".modal.show")) return;

  post({action:"checkOnline", name:userEl.value}).then(res=>{
    if(res.expired){
      showSessionExpiredAndReset();
    }
  });
}

// ------------------ Event ------------------
document.addEventListener("DOMContentLoaded",()=>{
  loadDashboard();
  setInterval(loadDashboard,30000);

  btnLoginEl.onclick = login;
  btnSubmitEl.onclick = submitData;

  passwordEl.addEventListener("keydown", e => {
    if(e.key === "Enter") login();
  });

  setInterval(checkSession, 10000);
});

window.addEventListener("beforeunload", () => {
  if(userEl.value){
    navigator.sendBeacon(
      GAS_URL,
      new URLSearchParams({
        action:"deleteOnline",
        name:userEl.value
      })
    );
  }
});
