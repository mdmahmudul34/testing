
document.addEventListener("DOMContentLoaded",()=>{
if(typeof HDTheme!=="undefined")HDTheme.init();
const out=document.getElementById("output"),cmd=document.getElementById("cmd");
const board=document.getElementById("board"),status=document.getElementById("status"),restart=document.getElementById("restart");
const data={
help:"about\nskills\nprojects\ngithub\ncontact\nplay\nclear",
about:"AI & Backend Engineer",
skills:"Python • FastAPI • React • AI",
projects:"AI Desktop Assistant\nTraceLens\nAI Agents",
github:"https://github.com/Kalpesh1Sharma",
contact:"Reach me on GitHub."
};
cmd.onkeydown=e=>{
if(e.key!=="Enter")return;
const c=cmd.value.trim().toLowerCase();
out.textContent+="\n> "+c+"\n";
if(c==="clear"){out.textContent="";board.style.display="none";restart.style.display="none";}
else if(c==="play"){start();}
else out.textContent+=(data[c]||"Unknown command")+"\n";
cmd.value="";
};
let g,over;
const W=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function win(p){return W.some(a=>a.every(i=>g[i]===p));}
function start(){
board.style.display="grid";restart.style.display="inline-block";board.innerHTML="";
g=Array(9).fill("");over=false;status.textContent="You are X";
for(let i=0;i<9;i++){let d=document.createElement("div");d.className="cell";d.onclick=()=>move(i);board.appendChild(d);}
}
function move(i){
if(over||g[i])return;g[i]="X";board.children[i].textContent="X";
if(win("X")){status.textContent="You win";over=true;return;}
let e=g.map((v,i)=>v===""?i:null).filter(v=>v!==null);if(!e.length){status.textContent="Draw";return;}
let m=e[Math.floor(Math.random()*e.length)];g[m]="O";board.children[m].textContent="O";
if(win("O")){status.textContent="Computer wins";over=true;}
}
restart.onclick=start;
});
