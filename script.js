const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captureBtn = document.getElementById("captureBtn");
const recordBtn = document.getElementById("recordBtn");
const switchBtn = document.getElementById("switchBtn");
const timerBtn = document.getElementById("timerBtn");

const flash = document.getElementById("flash");
const timestamp = document.getElementById("timestamp");
const recording = document.getElementById("recording");
const timerDisplay = document.getElementById("timerDisplay");

const memoryCounter =
document.getElementById("memoryCounter");

const photoCounter =
document.getElementById("photoCounter");

const gallery =
document.getElementById("gallery");

const viewer =
document.getElementById("viewer");

const viewerImage =
document.getElementById("viewerImage");

const closeViewer =
document.getElementById("closeViewer");

const deletePhotoBtn =
document.getElementById("deletePhotoBtn");

const downloadPhotoBtn =
document.getElementById("downloadPhotoBtn");

const clearGalleryBtn =
document.getElementById("clearGalleryBtn");

const filterButtons =
document.querySelectorAll(".filter-btn");

let stream = null;
let facingMode = "environment";

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

let selectedPhoto = null;

let timerSeconds = 0;

let currentFilter = "normal";

/* =====================
TIMESTAMP
===================== */

function updateTimestamp(){

const now = new Date();

timestamp.innerText =
now.toLocaleDateString(
"en-US",
{
day:"2-digit",
month:"short",
year:"numeric"
}
)
+
" "
+
now.toLocaleTimeString();

}

setInterval(updateTimestamp,1000);
updateTimestamp();

/* =====================
CAMERA
===================== */

async function startCamera(){

try{

if(stream){

stream
.getTracks()
.forEach(
track=>track.stop()
);

}

stream =
await navigator
.mediaDevices
.getUserMedia({

video:{
facingMode:facingMode
},

audio:true

});

video.srcObject =
stream;

}
catch(err){

console.error(err);

alert(
"Camera Permission Required"
);

}

}

startCamera();

/* =====================
FLASH
===================== */

function triggerFlash(){

flash.classList.add(
"active"
);

setTimeout(()=>{

flash.classList.remove(
"active"
);

},200);

}

/* =====================
MEMORY
===================== */

function updateMemory(){

const photos =
JSON.parse(
localStorage.getItem(
"chu_cam_gallery"
)
) || [];

memoryCounter.innerText =
"MEM " +
String(
photos.length
).padStart(
3,
"0"
);

photoCounter.innerText =
"📷 " +
photos.length;

}

updateMemory();

/* =====================
GALLERY
===================== */

function loadGallery(){

gallery.innerHTML = "";

const photos =
JSON.parse(
localStorage.getItem(
"chu_cam_gallery"
)
) || [];

photos
.slice()
.reverse()
.forEach(photo=>{

const img =
document.createElement(
"img"
);

img.src = photo;

img.onclick = ()=>{

selectedPhoto =
photo;

viewerImage.src =
photo;

viewer.style.display =
"flex";

};

gallery.appendChild(
img
);

});

}

loadGallery();

function saveGallery(image){

const photos =
JSON.parse(
localStorage.getItem(
"chu_cam_gallery"
)
) || [];

photos.push(image);

localStorage.setItem(
"chu_cam_gallery",
JSON.stringify(
photos
)
);

updateMemory();

loadGallery();

}

/* =====================
VIEWER
===================== */

closeViewer.onclick = ()=>{

viewer.style.display =
"none";

};

downloadPhotoBtn.onclick =
()=>{

if(!selectedPhoto)
return;

const link =
document.createElement(
"a"
);

link.href =
selectedPhoto;

link.download =
"CHU_CAM.jpg";

link.click();

};

deletePhotoBtn.onclick =
()=>{

let photos =
JSON.parse(
localStorage.getItem(
"chu_cam_gallery"
)
) || [];

photos =
photos.filter(
p=>p!==selectedPhoto
);

localStorage.setItem(
"chu_cam_gallery",
JSON.stringify(
photos
)
);

viewer.style.display =
"none";

updateMemory();

loadGallery();

};

clearGalleryBtn.onclick =
()=>{

if(
confirm(
"Delete all photos?"
)
){

localStorage.removeItem(
"chu_cam_gallery"
);

updateMemory();

loadGallery();

}

};

/* =====================
FILTERS
===================== */

filterButtons.forEach(btn=>{

btn.addEventListener(
"click",
()=>{

filterButtons
.forEach(
b=>b.classList.remove(
"active"
)
);

btn.classList.add(
"active"
);

currentFilter =
btn.dataset.filter;

applyFilter();

}
);

});

function applyFilter(){

switch(currentFilter){

case "nokia":

video.style.filter =
"contrast(150%) brightness(110%) saturate(40%) blur(1px)";

break;

case "digicam":

video.style.filter =
"contrast(145%) brightness(108%) saturate(70%)";

break;

case "bw":

video.style.filter =
"grayscale(100%) contrast(130%)";

break;

default:

video.style.filter =
"contrast(140%) brightness(108%) saturate(65%)";

}

}

/* =====================
TIMER
===================== */

timerBtn.onclick = ()=>{

if(timerSeconds === 0){

timerSeconds = 3;

alert("3 Second Timer");

}
else if(timerSeconds === 3){

timerSeconds = 5;

alert("5 Second Timer");

}
else{

timerSeconds = 0;

alert("Timer Off");

}

};

async function startCountdown(){

if(timerSeconds===0)
return true;

for(
let i=timerSeconds;
i>0;
i--
){

timerDisplay.innerText =
i;

timerDisplay.style.display =
"block";

await new Promise(
r=>setTimeout(
r,
1000
)
);

}

timerDisplay.style.display =
"none";

return true;

}

/* =====================
PHOTO
===================== */

captureBtn.onclick =
async ()=>{

await startCountdown();

triggerFlash();

canvas.width = 640;
canvas.height = 480;

ctx.drawImage(
video,
0,
0,
640,
480
);

/* Digital Noise */

const imageData =
ctx.getImageData(
0,
0,
640,
480
);

const data =
imageData.data;

for(
let i=0;
i<data.length;
i+=4
){

const noise =
(Math.random()*14)-7;

data[i]+=noise;
data[i+1]+=noise;
data[i+2]+=noise;

}

ctx.putImageData(
imageData,
0,
0
);

ctx.fillStyle =
"#FFD400";

ctx.font =
"16px monospace";

ctx.fillText(
timestamp.innerText,
15,
460
);

const image =
canvas.toDataURL(
"image/jpeg",
0.42
);

saveGallery(
image
);

const link =
document.createElement(
"a"
);

link.href =
image;

link.download =
`CHU_CAM_${Date.now()}.jpg`;

link.click();

};

/* =====================
SWITCH CAMERA
===================== */

switchBtn.onclick =
()=>{

facingMode =
facingMode ===
"environment"
?
"user"
:
"environment";

startCamera();

};

/* =====================
VIDEO
===================== */

recordBtn.onclick =
()=>{

if(!isRecording){

startRecording();

}
else{

stopRecording();

}

};

function startRecording(){

recordedChunks = [];

mediaRecorder =
new MediaRecorder(
stream
);

mediaRecorder.ondataavailable =
e=>{

if(
e.data.size > 0
){

recordedChunks.push(
e.data
);

}

};

mediaRecorder.onstop =
saveVideo;

mediaRecorder.start();

recording.style.display =
"block";

recordBtn.innerText =
"⏹";

isRecording = true;

}

function stopRecording(){

mediaRecorder.stop();

recordBtn.innerText =
"🎥";

recording.style.display =
"none";

isRecording = false;

}

function saveVideo(){

const blob =
new Blob(
recordedChunks,
{
type:"video/webm"
}
);

const url =
URL.createObjectURL(
blob
);

const link =
document.createElement(
"a"
);

link.href =
url;

link.download =
`CHU_CAM_VIDEO_${Date.now()}.webm`;

link.click();

URL.revokeObjectURL(
url
);

}

/* =====================
CLEANUP
===================== */

window.addEventListener(
"beforeunload",
()=>{

if(stream){

stream
.getTracks()
.forEach(
track=>track.stop()
);

}

}
);

applyFilter();