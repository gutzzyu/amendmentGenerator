import React from "react";

export default function Step3Preview({ generatedHTML }) {
  function exportPDF() {
    if (!generatedHTML) { alert('Please generate the document first (Step 2) before exporting.'); return; }

    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .map(l => `<link rel="stylesheet" href="${l.href}">`)
      .join('\n');
    const inlineStyles = [...document.querySelectorAll('style')]
      .map(s => `<style>${s.textContent}</style>`)
      .join('\n');

    const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${styleLinks}
${inlineStyles}
<style>
*,*:before,*:after{box-sizing:border-box!important;}
html,body{margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important;}
.document-page{width:100%!important;min-height:0!important;padding:0 4px!important;margin:0!important;box-shadow:none!important;font-family:'Times New Roman',Times,serif!important;font-size:12pt!important;line-height:1.65!important;color:#000!important;background:#fff!important;}
@page{size:8.5in 13in;margin:1in 1in;}
p,.doc-indent,.doc-deep-indent{orphans:3;widows:3;}
.avoid-break,table.lt,.sig-grid{page-break-inside:avoid;break-inside:avoid;}
table.lt{table-layout:fixed!important;width:99%!important;margin:0 auto 10pt auto!important;border-collapse:collapse!important;}
table.lt th,table.lt td{word-wrap:break-word!important;overflow-wrap:break-word!important;}
table.lt.subs-table th:nth-child(1),table.lt.subs-table td:nth-child(1){width:28%;}
table.lt.subs-table th:nth-child(2),table.lt.subs-table td:nth-child(2){width:14%;}
table.lt.subs-table th:nth-child(3),table.lt.subs-table td:nth-child(3){width:16%;}
table.lt.subs-table th:nth-child(4),table.lt.subs-table td:nth-child(4){width:20%;}
table.lt.subs-table th:nth-child(5),table.lt.subs-table td:nth-child(5){width:22%;}
table.lt.person-table th:nth-child(1),table.lt.person-table td:nth-child(1){width:35%;}
table.lt.person-table th:nth-child(2),table.lt.person-table td:nth-child(2){width:18%;}
table.lt.person-table th:nth-child(3),table.lt.person-table td:nth-child(3){width:47%;}
</style>
</head>
<body>${generatedHTML}</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(printHTML); doc.close();
    iframe.onload = () => {
      setTimeout(() => {
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(e) { console.error(e); }
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 600);
    };
  }

  return (
    <div>
      <div id="export-bar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <h2 style={{margin:0}}>Document Preview</h2>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn" onClick={exportPDF}>🖨 Print / Export PDF</button>
        </div>
      </div>
      <div id="legal-preview">
        {!generatedHTML
          ? <p style={{color:'#888',textAlign:'center',padding:40}}>Generate documents from Step 2 to see the preview.</p>
          : <div id="export-content" dangerouslySetInnerHTML={{ __html: generatedHTML }} />
        }
      </div>
    </div>
  );
}
