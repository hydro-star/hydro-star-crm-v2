/* Hydro Star CRM — geração de proposta sobre o modelo PDF original. */
(function(){
"use strict";
const TEMPLATE_URL="assets/hydro-star-proposta-template.pdf",PDF_LIB_URL="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
let libPromise;
function loadLib(){if(window.PDFLib)return Promise.resolve(window.PDFLib);if(!libPromise)libPromise=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=PDF_LIB_URL;s.onload=()=>window.PDFLib?resolve(window.PDFLib):reject(new Error("Biblioteca PDF não carregou."));s.onerror=()=>reject(new Error("Não foi possível carregar a biblioteca PDF."));document.head.appendChild(s)});return libPromise}
function generate(q,deps){
const state=deps.state,date=deps.date,money=deps.money,client=(state.clients||[]).find(c=>c.id===q.clientId)||{},company=q.company||{phone:"(12) 98216-2998",email:"hydrostar@gmail.com",installationWarranty:"3 meses"},items=Array.isArray(q.items)?q.items:[],materials=items.filter(x=>x.kind==="material"),labor=items.filter(x=>x.kind==="labor"),spec=String(q.specification||"").trim();
if(materials.length>12){alert("O modelo original comporta até 12 materiais nesta versão. Reduza a lista antes de gerar o PDF.");return}
if(spec.length>1800){alert("A especificação está muito longa para a página do modelo. Reduza o texto antes de gerar o PDF.");return}
const safe=v=>String(v==null||v===""?"—":v).replace(/[\r\n]+/g," ").slice(0,250),fmt=v=>money(Number(v||0)),mat=Number(q.materialsSubtotal??materials.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitPrice||0),0)),lab=Number(q.laborSubtotal??labor.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitPrice||0),0)),profit=Number(q.materialProfitValue||0),risk=Number(q.riskValue||0),total=Number((mat+profit+lab+risk).toFixed(2)),address=[q.customerAddress||client.address,q.neighborhood||client.neighborhood,[q.city||client.city,q.state||client.state].filter(Boolean).join(" - ")].filter(Boolean).join(", "),customer=safe(client.name||"Cliente"),dateText=safe(date(q.date)),deadline=q.deliveryDeadline?safe(q.deliveryDeadline)+" dias":"A combinar",profitRate=Number(q.materialProfitRate??(mat?profit/mat*100:0)),riskRate=Number(q.riskRate??(lab?risk/lab*100:0));
(async()=>{
const PDFLib=await loadLib(),response=await fetch(TEMPLATE_URL,{cache:"no-store"});if(!response.ok)throw new Error("O arquivo original do modelo não foi encontrado (HTTP "+response.status+").");
const pdf=await PDFLib.PDFDocument.load(await response.arrayBuffer()),pages=pdf.getPages();if(pages.length<5)throw new Error("O modelo original precisa conter cinco páginas.");
const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica),bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold),dark=PDFLib.rgb(.12,.13,.17),pink=PDFLib.rgb(.95,0,.38),white=PDFLib.rgb(1,1,1),cream=PDFLib.rgb(1,.94,.77);
const box=(p,x,y,w,h,color=white)=>{const s=p.getSize(),k=s.width/768;p.drawRectangle({x:x*k,y:s.height-(y+h)*k,width:w*k,height:h*k,color,borderWidth:0})};
const draw=(p,value,x,y,size=12,opt={})=>{const s=p.getSize(),k=s.width/768;p.drawText(String(value??"—"),{x:x*k,y:s.height-y*k-size*k,size:size*k,font:opt.bold?bold:font,color:opt.color||dark,maxWidth:(opt.maxWidth||680)*k})};
const line=(p,x1,y1,x2,y2,thickness=.6,color=dark)=>{const s=p.getSize(),k=s.width/768;p.drawLine({start:{x:x1*k,y:s.height-y1*k},end:{x:x2*k,y:s.height-y2*k},thickness,color})};
const wrapped=(p,value,x,y,max=82,size=12,gap=18)=>{const words=String(value).split(/\s+/),lines=[];let lineText="";for(const word of words){const next=lineText?lineText+" "+word:word;if(next.length>max&&lineText){lines.push(lineText);lineText=word}else lineText=next}if(lineText)lines.push(lineText);if(lines.length>36)throw new Error("A especificação não cabe na página 2. Reduza o texto.");lines.forEach((t,i)=>draw(p,t,x,y+i*gap,size,{maxWidth:650}));};
{const p=pages[0];box(p,275,0,493,45,cream);draw(p,customer,385,11,14,{bold:true,maxWidth:340});box(p,275,895,195,78,cream);draw(p,dateText,290,925,12,{bold:true})}
{const p=pages[1];
// Apaga toda a área variável do texto antigo, inclusive o placeholder, antes de escrever a especificação.
box(p,35,135,698,770,white);if(spec)wrapped(p,spec,62,153);else draw(p,"Especificação não informada no orçamento.",62,153,12)}
{const p=pages[2];
// Limpa por inteiro a região variável para que os textos de desconto do template não vazem para a tabela.
box(p,25,130,718,770,white);draw(p,"RESUMO DE INVESTIMENTOS",48,145,15,{bold:true,color:pink});
draw(p,"VALOR TOTAL",390,175,10,{bold:true});
draw(p,"DESCONTOS",535,175,10,{bold:true});
line(p,42,195,720,195,1,dark);
draw(p,"DESCRIÇÃO DO SERVIÇO",48,216,10,{bold:true});
line(p,42,236,720,236,1,dark);
const rows=[["Materiais",fmt(mat+profit)],["Mão de Obra",fmt(lab+risk)]];
rows.forEach((r,i)=>{const y=260+i*42;draw(p,r[0],48,y,11,{maxWidth:320});draw(p,r[1],390,y,11,{maxWidth:125});line(p,42,y+25,510,y+25,.4,PDFLib.rgb(.78,.78,.78))});
draw(p,"TOTAL DO ORÇAMENTO",48,355,10,{bold:true,maxWidth:300});draw(p,fmt(total),390,355,13,{bold:true,color:pink,maxWidth:120});line(p,42,378,510,378,1,dark);
// Cada desconto ocupa um bloco próprio. Os rótulos são divididos manualmente para
// que a quebra automática de linha não invada a linha do valor em R$.
draw(p,"0% = ATÉ 10X SEM JUROS",535,212,8.5,{bold:true});
draw(p,"NO CARTÃO",535,224,8.5,{bold:true});
draw(p,fmt(total),535,239,11,{bold:true,color:pink});
draw(p,"4% = 1X NO CRÉDITO",535,268,8.5,{bold:true});
draw(p,"OU DÉBITO",535,280,8.5,{bold:true});
draw(p,fmt(total*0.96),535,295,11,{bold:true,color:pink});
draw(p,"7% = À VISTA (PIX)",535,324,8.5,{bold:true});
draw(p,fmt(total*0.93),535,341,11,{bold:true,color:pink});
}
{const p=pages[3];box(p,0,45,768,90,white);draw(p,"LISTA DE MATERIAIS",272,75,16,{bold:true});box(p,48,125,670,300,white);draw(p,"Material",62,140,11,{bold:true});draw(p,"Descrição / modelo",430,140,11,{bold:true});const rows=materials.length?materials:[{name:"",description:""}];for(let i=0;i<rows.length;i++){const it=rows[i]||{},y=175+i*29;draw(p,it.name||"",62,y,10,{maxWidth:320});draw(p,it.description||(it.quantity?"Quantidade: "+it.quantity:""),430,y,10,{maxWidth:270});line(p,58,y+12,710,y+12,.4,PDFLib.rgb(.75,.75,.75))}box(p,0,920,768,104,white)}
{const p=pages[4];box(p,85,175,610,120,white);draw(p,"PROPOSTA VÁLIDA: "+safe(q.validityDays||7)+" dias",96,190,13,{bold:true});draw(p,"PRAZO DE ENTREGA: "+deadline,96,215,13,{bold:true});draw(p,"GARANTIA DA INSTALAÇÃO: "+safe(company.installationWarranty||"3 meses"),96,240,13,{bold:true});draw(p,"*A contar da entrega da instalação e assinatura do Laudo de Entrega.",96,262,9,{maxWidth:580});if(address){box(p,95,298,590,23,white);draw(p,"ENDEREÇO: "+address,96,302,10,{maxWidth:570})}
// Desenha o visto como linhas para evitar falha de codificação do caractere ✔ na fonte padrão.
box(p,45,885,700,90,white);line(p,85,918,91,924,1.5,pink);line(p,91,924,101,910,1.5,pink);draw(p,"FASCINAÇÃO por Excelência, Segurança e Pontualidade",110,910,11,{bold:true,maxWidth:590})}
const blob=new Blob([await pdf.save()],{type:"application/pdf"}),url=URL.createObjectURL(blob),win=window.open(url,"_blank");if(!win){URL.revokeObjectURL(url);alert("O navegador bloqueou a janela do PDF. Permita pop-ups para este site e tente novamente.")}
})().catch(err=>{console.error("Hydro Star PDF:",err);alert("Não foi possível gerar o PDF: "+(err.message||"erro inesperado"))})
}
window.HydroStarQuotePdf=Object.freeze({generate})
})();