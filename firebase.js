/* ============================================================
   firebase.js — ตัวเชื่อมกับ Firebase (Auth + Firestore)
   หน้าที่: เชื่อมต่อ, โหลดการตั้งค่า/สินค้าสาธารณะ, ให้ฟังก์ชัน FB แก่ app.js
   แล้วโหลด app.js (ตรรกะร้านทั้งหมด) ต่อ
   ============================================================ */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence,browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,deleteDoc,collection,getDocs,query,where} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {firebaseConfig,ADMIN_EMAIL} from './firebase-config.js?v=2';

const app$=document.getElementById('app');
const fail=m=>{app$.innerHTML='<div style="padding:28px;font:15px/1.7 sans-serif;color:#442E23"><b>เปิดเว็บไม่ได้</b><br>'+m+'</div>'};
if(!firebaseConfig.apiKey||/วาง/.test(firebaseConfig.apiKey)){fail('ยังไม่ได้ใส่ค่า Firebase ในไฟล์ firebase-config.js (ดู README ข้อ 3)')}
else boot();

async function boot(){
  const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
  let sec=null;
  const clean=o=>JSON.parse(JSON.stringify(o));
  const D=(c,id)=>doc(db,c,id);

  const FB={
    ADMIN_EMAIL,
    user:()=>auth.currentUser,
    onUser:cb=>onAuthStateChanged(auth,cb),
    async signIn(email,pw,remember){await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);return (await signInWithEmailAndPassword(auth,email,pw)).user.uid},
    async signUp(email,pw,remember){await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);return (await createUserWithEmailAndPassword(auth,email,pw)).user.uid},
    signOut:()=>signOut(auth),
    // แอดมินสร้างบัญชีสมาชิกโดยไม่หลุดจากการล็อกอินของแอดมิน (ใช้แอปรองชั่วคราว)
    async createUser(email,pw){if(!sec)sec=initializeApp(firebaseConfig,'secondary');const a2=getAuth(sec);const uid=(await createUserWithEmailAndPassword(a2,email,pw)).user.uid;await signOut(a2);return uid},
    newId:()=>doc(collection(db,'orders')).id,
    // ---- ตั้งค่าร้าน (ทุกคนอ่านได้ แอดมินเขียนได้) ----
    setCfg:(k,v)=>setDoc(D('settings',k),{v:JSON.stringify(v===undefined?null:v)}),
    // รายการยาว (สินค้า แบนเนอร์ ส่วนลด ช่องทางชำระเงิน) แบ่งเป็นก้อน ไม่เกินราว 600KB ต่อเอกสาร
    async setArr(k,arr){
      const enc=new TextEncoder(),chunks=[];let cur=[],sz=0;
      for(const it of arr){const b=enc.encode(JSON.stringify(it)).length;if(sz+b>600000&&cur.length){chunks.push(cur);cur=[];sz=0}cur.push(it);sz+=b+1}
      if(cur.length||!chunks.length)chunks.push(cur);
      const old=await getDocs(query(collection(db,'lists'),where('k','==',k)));
      await Promise.all(chunks.map((c,n)=>setDoc(D('lists',k+'-'+n),{k,n,v:JSON.stringify(c)})));
      await Promise.all(old.docs.filter(d=>d.data().n>=chunks.length).map(d=>deleteDoc(d.ref)));
    },
    // ---- สมาชิก ----
    setMember:(uid,d,merge)=>setDoc(D('members',uid),clean(d),merge?{merge:true}:undefined),
    async getMember(uid){const s=await getDoc(D('members',uid));return s.exists()?{uid,...s.data()}:null},
    async listMembers(){return (await getDocs(collection(db,'members'))).docs.map(d=>({uid:d.id,...d.data()}))},
    delMember:uid=>deleteDoc(D('members',uid)),
    // ---- ยอดผ่อน/เครื่องของลูกค้า (แอดมินเขียน ลูกค้าอ่านของตัวเอง) ----
    setBal:(uid,items)=>setDoc(D('bal',uid),{items:clean(items)}),
    async getBal(uid){const s=await getDoc(D('bal',uid));return s.exists()?(s.data().items||[]):[]},
    async listBal(){const o={};(await getDocs(collection(db,'bal'))).docs.forEach(d=>{o[d.id]=d.data().items||[]});return o},
    delBal:uid=>deleteDoc(D('bal',uid)),
    // ---- ออเดอร์ ----
    setOrder(id,o){const r={...o};delete r._id;return setDoc(D('orders',id),clean(r))},
    async listOrders(uid){const s=await getDocs(uid?query(collection(db,'orders'),where('uid','==',uid)):collection(db,'orders'));return s.docs.map(d=>({...d.data(),_id:d.id})).sort((a,b)=>(b.ts||0)-(a.ts||0))},
    delOrder:id=>deleteDoc(D('orders',id))
  };
  window.FB=FB;

  // โหลดค่าสาธารณะ (ตั้งค่า สินค้า แบนเนอร์ ฯลฯ) ให้พร้อมก่อน app.js ทำงาน
  const pre={};
  try{
    (await getDocs(collection(db,'settings'))).forEach(d=>{try{pre[d.id]=JSON.parse(d.data().v)}catch(e){}});
    const g={};(await getDocs(collection(db,'lists'))).forEach(d=>{const x=d.data();(g[x.k]=g[x.k]||[]).push([x.n,x.v])});
    Object.keys(g).forEach(k=>{pre[k]=g[k].sort((a,b)=>a[0]-b[0]).flatMap(([n,v])=>JSON.parse(v))});
  }catch(e){console.warn('โหลดค่าตั้งต้นไม่ได้ (ใช้ค่าเริ่มต้นแทน):',e)}
  window.__PRE=pre;

  const s=document.createElement('script');s.src='app.js?v=1';
  s.onerror=()=>fail('โหลดไฟล์ app.js ไม่ได้ ตรวจว่าอัปโหลดครบทุกไฟล์');
  document.body.appendChild(s);
}
