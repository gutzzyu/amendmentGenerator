import React, { useState } from "react";
import TableEditor from "./shared/TableEditor";
import { BASE_INCORP_COLS, BASE_DIR_COLS, BASE_SUBS_COLS, SIGNATORY_COLS } from "../hooks/useAppState";
import { formatDate } from "../utils/helpers";

export default function Step1Baseline({ s, setActiveTab }) {
  const [tradeNameInput, setTradeNameInput] = useState('');
  const [formerlyTradeInput, setFormerlyTradeInput] = useState('');
  const [fileStatus, setFileStatus] = useState(null);

  // ── File upload ──
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) { setFileStatus({ type: 'err', msg: 'Only PDF files supported.' }); return; }
    s.setOverlayVisible(true);
    setFileStatus({ type: 'info', msg: `Reading ${file.name}…` });
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await window.fetch('/api/extract', { method: 'POST', body: form });
      const contentType = res.headers.get("content-type");
      
      if (!res.ok) {
        let err = `Server error ${res.status}`;
        if (contentType && contentType.includes("application/json")) {
          try { const j = await res.json(); err = j.detail || err; } catch {}
        } else {
          const text = await res.text();
          console.error("Non-JSON Error Response:", text);
          err = `Server returned non-JSON response (${res.status}). This often means the request was blocked by a firewall or the server crashed.`;
        }
        throw new Error(err);
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but got:", text);
        if (text.includes("Cookie check") || text.includes("Action required to load your app")) {
          setFileStatus({ 
            type: 'err', 
            msg: 'BROWSER SECURITY BLOCK: Your browser is blocking a security cookie. To fix this, you MUST open the app in a NEW TAB using the icon in the top right of the preview, or click the link below.',
            isCookieErr: true
          });
          return;
        }
        throw new Error("Server returned HTML/Text instead of JSON. The extraction request might have been blocked or redirected.");
      }

      const data = await res.json();
      s.populateFromExtraction(data);
      s.setExtractSummary(data);
      setFileStatus({ type: 'ok', msg: `AI extraction complete — "${file.name}" processed.` });
    } catch (err) {
      setFileStatus({ type: 'err', msg: 'Extraction failed: ' + err.message });
    } finally {
      s.setOverlayVisible(false);
    }
  }

  function statusColor(type) {
    return type === 'ok' ? '#4caf50' : type === 'err' ? '#f44336' : '#c9a651';
  }

  // ── Extraction summary render ──
  function renderSummary() {
    const d = s.extractSummary;
    if (!d) return null;
    const art1Date = d.article1AmendedDate || d.documentAmendedDate || '';
    const checks = [
      ['Corporate Name', d.corporateName],
      ['Document Amended Date', art1Date ? formatDate(art1Date) : ''],
      ['Trade Name(s)', Array.isArray(d.tradeNames) ? d.tradeNames.join(', ') : ''],
      ['Primary Purpose', d.primaryPurpose ? d.primaryPurpose.substring(0,60)+'…' : ''],
      ['Address', [d.street, d.city].filter(Boolean).join(', ')],
      ['Term', d.term ? (d.term==='0'?'Perpetual':d.term+' years') : ''],
      ['No. of Directors', d.numberOfDirectors],
      ['Auth. Capital Stock', d.acsAmount],
      ['Treasurer', d.treasurer],
      ['SEC Reg. No.', d.secRegistrationNo],
      ['Incorporators', Array.isArray(d.incorporators) ? d.incorporators.length+' row(s)' : ''],
      ['Directors', Array.isArray(d.directors) ? d.directors.length+' row(s)' : ''],
      ['Subscribers', Array.isArray(d.subscribers) ? d.subscribers.length+' row(s)' : ''],
      ['Signatories', Array.isArray(d.signatories) ? d.signatories.length+' row(s)' : ''],
    ];
    return (
      <div style={{marginTop:12,background:'#0d1117',borderRadius:6,padding:12,border:'1px solid var(--border)'}}>
        <p style={{color:'var(--gold)',fontWeight:700,fontSize:'.82rem',margin:'0 0 6px 0'}}>✅ Extraction Complete — Fields Populated:</p>
        <div style={{fontSize:'.78rem',color:'#8b949e',lineHeight:1.8}}>
          {checks.map(([label, val]) => {
            const ok = val && String(val).trim() !== '';
            return <span key={label} style={{color: ok?'#4caf50':'#f44336', marginRight:16, display:'inline-block'}}>
              {ok?'✓':'✗'} <b>{label}:</b> {ok ? String(val) : 'Not found'}<br/>
            </span>;
          })}
        </div>
        <p style={{fontSize:'.75rem',color:'#555',margin:'8px 0 0 0'}}>Review and correct any fields below before proceeding.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <h2>Step 1 — Baseline AOI Data <span style={{fontSize:'.8rem',color:'#8b949e',fontWeight:400}}>(Current "FROM" State)</span></h2>
      </div>

      {/* Upload card */}
      <div className="card">
        <h3>📂 Upload Existing AOI — AI Auto-Extraction</h3>
        <p style={{fontSize:'.8rem',color:'#8b949e',margin:'0 0 10px 0'}}>Upload the company's current AOI (PDF). The AI will read the document and fill all fields automatically.</p>
        <input type="file" accept=".pdf" onChange={handleFile} />
        {fileStatus && (
          <div style={{fontSize:'.82rem',marginTop:8}}>
            <span style={{color: statusColor(fileStatus.type), fontWeight:700}}>
              {fileStatus.type==='ok'?'✓':fileStatus.type==='err'?'✗':'⟳'}
            </span>{' '}
            <span style={{color: fileStatus.type==='err'?'#f44336':'#ccc'}}>{fileStatus.msg}</span>
            {fileStatus.isCookieErr && (
              <div style={{marginTop:10}}>
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-gold"
                  style={{textDecoration:'none', display:'inline-block'}}
                >
                  🔗 Open in New Tab to Repair Connection
                </a>
                <p style={{fontSize:'.7rem', color:'#555', marginTop:6}}>After the new tab loads, you can return here or work in that tab.</p>
              </div>
            )}
          </div>
        )}
        {renderSummary()}
      </div>

      {/* Article I */}
      <div className="card">
        <h3>Article I — Corporate Name</h3>
        <div className="input-grid">
          <div className="full">
            <label className="field-label">Current Registered Name</label>
            <input type="text" value={s.baseName} onChange={e => s.setBaseName(e.target.value)} placeholder="REQUIRES CLIENT INPUT" />
          </div>
          <div className="full">
            <label className="field-label">Article I — Prior Amendment Date</label>
            <input type="date" value={s.baseArt1AmdDate} onChange={e => s.setBaseArt1AmdDate(e.target.value)} />
          </div>
          <div className="full">
            <label className="field-label">Former Name (leave blank if original name)</label>
            <input type="text" value={s.baseFormerly} onChange={e => s.setBaseFormerly(e.target.value)} placeholder="e.g. RIZAL POULTRY FARM CORPORATION" />
            <p style={{fontSize:'.72rem',color:'#555',margin:'4px 0 0 0'}}>Only fill if previously known by a different name. Appears as "Formerly: [NAME]" in the document.</p>
          </div>
          <div className="full">
            <label className="field-label">Former Trade Name(s) (associated with the former name above)</label>
            {s.baseFormerlyTradeNames.length === 0
              ? <p style={{fontSize:'.78rem',color:'#555',margin:'4px 0'}}>No former trade names added.</p>
              : s.baseFormerlyTradeNames.map((name, i) => (
                <div key={i} className="trade-name-tag">
                  <span>{name}</span>
                  <button title="Remove" onClick={() => s.removeBaseFormerlyTradeName(i)}>✕</button>
                </div>
              ))
            }
            <div className="trade-name-add-row">
              <input
                type="text"
                value={formerlyTradeInput}
                placeholder="e.g. OLD TRADE NAME"
                onChange={e => setFormerlyTradeInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){s.addBaseFormerlyTradeName(formerlyTradeInput);setFormerlyTradeInput('');e.preventDefault();}}}
              />
              <button className="btn btn-sm btn-gold" onClick={() => {s.addBaseFormerlyTradeName(formerlyTradeInput);setFormerlyTradeInput('');}}>+ Add</button>
            </div>
          </div>
          <div className="full">
            <label className="field-label">Trade Name(s) — "Doing Business Under the Name/s and Style/s of"</label>
            <p style={{fontSize:'.72rem',color:'#555',margin:'4px 0 6px 0'}}>Auto-extracted from AOI. Add, edit, or remove trade names as needed.</p>
            {s.baseTradeNames.length === 0
              ? <p style={{fontSize:'.78rem',color:'#555',margin:'4px 0'}}>No trade names added yet.</p>
              : s.baseTradeNames.map((name, i) => (
                <div key={i} className="trade-name-tag">
                  <span>{name}</span>
                  <button title="Remove" onClick={() => s.removeBaseTradeName(i)}>✕</button>
                </div>
              ))
            }
            <div className="trade-name-add-row">
              <input
                type="text"
                value={tradeNameInput}
                placeholder="e.g. RIZAL FARMS"
                onChange={e => setTradeNameInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){s.addBaseTradeName(tradeNameInput);setTradeNameInput('');e.preventDefault();}}}
              />
              <button className="btn btn-sm btn-gold" onClick={() => {s.addBaseTradeName(tradeNameInput);setTradeNameInput('');}}>+ Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Article II */}
      <div className="card">
        <h3>Article II — Primary & Secondary Purpose</h3>
        <div className="input-grid">
          <div className="full">
            <label className="field-label">CURRENT PRIMARY PURPOSE</label>
            <textarea value={s.basePurpose} onChange={e => s.setBasePurpose(e.target.value)} placeholder="REQUIRES CLIENT INPUT" rows={4} />
          </div>
          <div className="full">
            <label className="field-label">DATE PRIMARY PURPOSE WAS LAST AMENDED (LEAVE BLANK IF ORIGINAL)</label>
            <input type="date" value={s.baseArt2PrimaryAmdDate} onChange={e => s.setBaseArt2PrimaryAmdDate(e.target.value)} />
          </div>
          <div className="full">
            <label className="field-label">CURRENT SECONDARY PURPOSE(S)</label>
            <textarea value={s.baseSecPurpose} onChange={e => s.setBaseSecPurpose(e.target.value)} placeholder="REQUIRES CLIENT INPUT (leave blank if none)" rows={3} />
          </div>
          <div className="full">
            <label className="field-label">DATE SECONDARY PURPOSE(S) WAS LAST AMENDED (LEAVE BLANK IF ORIGINAL)</label>
            <input type="date" value={s.baseArt2SecondaryAmdDate} onChange={e => s.setBaseArt2SecondaryAmdDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Article III */}
      <div className="card">
        <h3>Article III — Principal Office</h3>
        <p style={{fontSize:'.78rem',color:'#8b949e',margin:'0 0 8px 0'}}>Only fill No./Street if the document explicitly states a street address with a number or street type keyword. Leave blank if the document only lists barangay/city.</p>
        <div className="input-grid">
          <div className="full">
            <label className="field-label">NO. / STREET (LEAVE BLANK IF NOT EXPLICITLY IN DOCUMENT)</label>
            <input type="text" value={s.baseStreet} onChange={e => s.setBaseStreet(e.target.value)} placeholder="e.g. 293 General Ordonez Street — leave blank if not stated" />
          </div>
          <div>
            <label className="field-label">BARANGAY / DISTRICT</label>
            <input type="text" value={s.baseBrgy} onChange={e => s.setBaseBrgy(e.target.value)} placeholder="e.g. Barangay Palma Dos" />
          </div>
          <div>
            <label className="field-label">CITY / MUNICIPALITY</label>
            <input type="text" value={s.baseCity} onChange={e => s.setBaseCity(e.target.value)} placeholder="e.g. City of Alaminos" />
          </div>
          <div>
            <label className="field-label">PROVINCE / REGION</label>
            <input type="text" value={s.baseProv} onChange={e => s.setBaseProv(e.target.value)} placeholder="e.g. Pangasinan" />
          </div>
          <div>
            <label className="field-label">ZIP CODE (OPTIONAL)</label>
            <input type="text" value={s.baseZip} onChange={e => s.setBaseZip(e.target.value)} placeholder="e.g. 1810" />
          </div>
          <div className="full">
            <label className="field-label">ARTICLE III — PRIOR AMENDMENT DATE</label>
            <input type="date" value={s.baseArt3AmdDate} onChange={e => s.setBaseArt3AmdDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Article IV */}
      <div className="card">
        <h3>Article IV — Corporate Term</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">TERM (YEARS — ENTER 0 FOR PERPETUAL)</label>
            <input type="number" value={s.baseTerm} onChange={e => s.setBaseTerm(e.target.value)} placeholder="e.g. 50 or 0 for perpetual" min={0} />
          </div>
          <div>
            <label className="field-label">ARTICLE IV — PRIOR AMENDMENT DATE</label>
            <input type="date" value={s.baseArt4AmdDate} onChange={e => s.setBaseArt4AmdDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Article V — Incorporators */}
      <div className="card">
        <h3>Article V — Incorporators</h3>
        <TableEditor
          cols={BASE_INCORP_COLS}
          rows={s.baseIncorp}
          onAdd={() => s.addRow(s.setBaseIncorp, BASE_INCORP_COLS)}
          onRemove={i => s.removeRow(s.setBaseIncorp, i)}
          onUpdate={(i,c,v) => s.updateRow(s.setBaseIncorp, i, c, v)}
        />
      </div>

      {/* Article VI — Directors */}
      <div className="card">
        <h3>Article VI — Board of Directors</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">Number of Directors</label>
            <input type="number" value={s.baseDirCount} onChange={e => s.setBaseDirCount(e.target.value)} placeholder="e.g. 7" min={1} />
          </div>
          <div>
            <label className="field-label">Article VI — Prior Amendment Date</label>
            <input type="date" value={s.baseArt6AmdDate} onChange={e => s.setBaseArt6AmdDate(e.target.value)} />
          </div>
        </div>
        <label className="field-label" style={{marginTop:14}}>Director Roster</label>
        <TableEditor
          cols={BASE_DIR_COLS}
          rows={s.baseDirs}
          onAdd={() => s.addRow(s.setBaseDirs, BASE_DIR_COLS)}
          onRemove={i => s.removeRow(s.setBaseDirs, i)}
          onUpdate={(i,c,v) => s.updateRow(s.setBaseDirs, i, c, v)}
        />
      </div>

      {/* Article VII — Capital */}
      <div className="card">
        <h3>Article VII — Capital Structure</h3>
        <div className="input-grid">
          <div className="full">
            <label className="field-label">Authorized Capital Stock (in words, ALL CAPS)</label>
            <input type="text" value={s.baseAcsWords} onChange={e => s.setBaseAcsWords(e.target.value)} placeholder="e.g. TWENTY MILLION" />
          </div>
          <div>
            <label className="field-label">Amount (₱)</label>
            <input type="text" value={s.baseAcsAmt} onChange={e => s.setBaseAcsAmt(e.target.value)} placeholder="e.g. 20,000,000.00" />
          </div>
          <div>
            <label className="field-label">No. of Shares</label>
            <input type="text" value={s.baseShares} onChange={e => s.setBaseShares(e.target.value)} placeholder="e.g. 2,000,000" />
          </div>
          <div>
            <label className="field-label">Par Value per Share (₱)</label>
            <input type="text" value={s.basePar} onChange={e => s.setBasePar(e.target.value)} placeholder="e.g. 10.00" />
          </div>
          <div>
            <label className="field-label">Article VII — Prior Amendment Date</label>
            <input type="date" value={s.baseArt7AmdDate} onChange={e => s.setBaseArt7AmdDate(e.target.value)} />
          </div>
        </div>
        <label className="field-label" style={{marginTop:14}}>Subscription Table (Articles VIII / IX)</label>
        <TableEditor
          cols={BASE_SUBS_COLS}
          rows={s.baseSubs}
          onAdd={() => s.addRow(s.setBaseSubs, BASE_SUBS_COLS)}
          onRemove={i => s.removeRow(s.setBaseSubs, i)}
          onUpdate={(i,c,v) => s.updateRow(s.setBaseSubs, i, c, v)}
        />
      </div>

      {/* Article X — Treasurer */}
      <div className="card">
        <h3>Article X — Treasurer-in-Trust</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">Treasurer Name</label>
            <input type="text" value={s.baseTreasurer} onChange={e => s.setBaseTreasurer(e.target.value)} placeholder="REQUIRES CLIENT INPUT" />
          </div>
          <div>
            <label className="field-label">Treasurer TIN</label>
            <input type="text" value={s.baseTreasurerTin} onChange={e => s.setBaseTreasurerTin(e.target.value)} placeholder="e.g. 106-265-745" />
          </div>
          <div>
            <label className="field-label">Treasurer Address</label>
            <input type="text" value={s.baseTreasurerAddr} onChange={e => s.setBaseTreasurerAddr(e.target.value)} placeholder="Residential address" />
          </div>
          <div>
            <label className="field-label">Treasurer Citizenship</label>
            <input type="text" value={s.baseTreasurerCit} onChange={e => s.setBaseTreasurerCit(e.target.value)} placeholder="e.g. Filipino" />
          </div>
        </div>
      </div>

      {/* Article IX — Filipino ownership */}
      <div className="card">
        <h3>Article IX — Filipino Ownership Restriction Clause</h3>
        <label className="field-label">Ninth Article Provision</label>
        <textarea value={s.baseNinth} onChange={e => s.setBaseNinth(e.target.value)} rows={3} />
      </div>

      {/* SEC Details */}
      <div className="card">
        <h3>SEC Registration Details</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">SEC Registration No.</label>
            <input type="text" value={s.baseSec} onChange={e => s.setBaseSec(e.target.value)} placeholder="e.g. CS201600162941" />
          </div>
          <div>
            <label className="field-label">Date of Registration</label>
            <input type="date" value={s.baseRegDate} onChange={e => s.setBaseRegDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Signatories */}
      <div className="card" style={{borderColor:'var(--gold)'}}>
        <h3 style={{color:'var(--gold)'}}>📝 Document Signatories</h3>
        <p style={{fontSize:'.8rem',color:'#8b949e',margin:'0 0 12px 0'}}>Persons who will physically sign the Amended AOI. Extracted from the signature block of the uploaded AOI.</p>
        <TableEditor
          cols={SIGNATORY_COLS}
          rows={s.signatories}
          onAdd={() => { s.addRow(s.setSignatories, SIGNATORY_COLS); s.addRow(s.setNewSignatories, SIGNATORY_COLS); }}
          onRemove={i => { s.removeRow(s.setSignatories, i); s.removeRow(s.setNewSignatories, i); }}
          onUpdate={(i,c,v) => { s.updateRow(s.setSignatories, i, c, v); s.updateRow(s.setNewSignatories, i, c, v); }}
          addLabel="+ Add Signatory"
        />
      </div>

      <button className="btn" onClick={() => setActiveTab('amend')}>Next: Select Amendments →</button>
    </div>
  );
}
