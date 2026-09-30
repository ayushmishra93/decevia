// Minimal, deterministic multi-page text PDF; no HTML or external resources are evaluated.
export function pdfReport(title, snapshot) {
 const clean=value=>String(value).replace(/[^\x20-\x7e]/g,'?');
 const lines=[clean(title),'Generated from a saved database snapshot.',''];
 function walk(value,prefix='') {for(const [key,item] of Object.entries(value||{})) {if(item&&typeof item==='object'){lines.push(clean(prefix+key));walk(item,prefix+'  ');}else {const s=clean(prefix+key+': '+item);for(let i=0;i<s.length;i+=96)lines.push(s.slice(i,i+96));}}}
 walk(snapshot);
 const pages=[];for(let i=0;i<lines.length;i+=48)pages.push(lines.slice(i,i+48));
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'];
 const ids=[];
 pages.forEach((page,i)=>{const id=objects.length+1;ids.push(id);objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${id+1} 0 R >>`);const stream='BT /F1 9 Tf 40 755 Td 14 TL\n'+[...page,`Page ${i+1} of ${pages.length}`].map(line=>'('+line.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)')+') Tj T*').join('\n')+'\nET';objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);});
 objects[1]=`<< /Type /Pages /Kids [${ids.map(id=>id+' 0 R').join(' ')}] /Count ${ids.length} >>`;
 let out='%PDF-1.4\n';const offsets=[0];objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(out));out+=`${i+1} 0 obj\n${obj}\nendobj\n`;});const start=Buffer.byteLength(out);out+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;return Buffer.from(out);
}
