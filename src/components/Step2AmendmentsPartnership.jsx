import React, { useState } from "react";
import TableEditor from "./shared/TableEditor";
import { NEW_PARTNER_COLS, NEW_CONTRIB_COLS, SIGNATORY_COLS } from "../hooks/usePartnershipState";
import { PURPOSE_DB } from "../utils/purposeDb";
import { generatePartnershipDocumentHTML } from "../utils/partnershipDocGenerator";

const ARTICLES = [
  { id: '1',  label: 'Art. I — Name' },
  { id: '2',  label: 'Art. II — Purpose' },
  { id: '3',  label: 'Art. III — Office' },
  { id: '4',  label: 'Art. IV — Term' },
  { id: '5',  label: 'Art. V — Partners' },
  { id: '6',  label: 'Art. VI — Capital' },
  { id: '8',  label: 'Art. VIII — Management' },
];

export default function Step2AmendmentsPartnership({ s, setActiveTab, setGeneratedHTML }) {
  const [tradeInput, setTradeInput] = useState('');
  const [purposeQueryPrimary, setPurposeQueryPrimary] = useState('');
  const [purposeQuerySecondary, setPurposeQuerySecondary] = useState('');

  function toggleArt(id) {
    s.setSelectedArts(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === '1' && next['1']) {
        s.setAmendTradeNames(false);
        s.setNewTradeNames([]);
      }
      return next;
    });
  }

  function isArt(id) { return !!s.selectedArts[id]; }

  function handleAmendTradeToggle(checked) {
    s.setAmendTradeNames(checked);
    if (checked) s.setNewTradeNames([...s.baseTradeNames]);
  }

  function filterPurposes(query) {
    if (!query) return PURPOSE_DB;
    const q = query.toLowerCase();
    return PURPOSE_DB.filter(p => p.name.toLowerCase().includes(q) || p.text.toLowerCase().includes(q));
  }

  function selectPrimary(p) {
    s.setSelectedPrimary(p);
  }

  function selectSecondary(p) {
    s.setSelectedSecondary(prev =>
      prev.some(x => x.name === p.name)
        ? prev.filter(x => x.name !== p.name)
        : [...prev, p]
    );
  }

  function doGenerate() {
    const html = generatePartnershipDocumentHTML(s);
    setGeneratedHTML(html);
    setActiveTab('preview');
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <h2>Step 2 — Select &amp; Configure Amendments</h2>
      </div>

      <div className="card">
        <h3>Amendment Details</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">Date of Partners' Meeting</label>
            <input type="date" value={s.meetingDate} onChange={e => s.setMeetingDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Place of Meeting</label>
            <input type="text" value={s.meetingPlace} onChange={e => s.setMeetingPlace(e.target.value)} placeholder="Full address of meeting venue" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Select Articles to Amend</h3>
        <div className="article-selector">
          {ARTICLES.map(a => (
            <label key={a.id} className={`art-chip${isArt(a.id)?' checked':''}`}>
              <input type="checkbox" checked={!!isArt(a.id)} onChange={() => toggleArt(a.id)} />
              {a.label}
            </label>
          ))}
        </div>
      </div>

      {isArt('1') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article I — Partnership Name</h3>
          <p style={{fontSize:'.8rem',color:'#8b949e',margin:'0 0 8px 0'}}>CURRENT REGISTERED NAME: <b>{s.baseName || '—'}</b></p>
          
          <div className="input-grid">
            <div className="full">
              <label className="field-label">NEW PARTNERSHIP NAME (ALL CAPS)</label>
              <input type="text" value={s.newName} onChange={e => s.setNewName(e.target.value.toUpperCase())} placeholder="NEW PARTNERSHIP NAME" />
            </div>
            <div>
              <label className="field-label">ARTICLE I — PRIOR AMENDMENT DATE (IF PREVIOUSLY AMENDED)</label>
              <input type="date" value={s.newArt1AmdDate} onChange={e => s.setNewArt1AmdDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">FORMER NAME (IF CURRENT NAME WAS PREVIOUSLY CHANGED — LEAVE BLANK IF ORIGINAL NAME)</label>
              <input type="text" value={s.newFormerly} onChange={e => s.setNewFormerly(e.target.value.toUpperCase())} placeholder="e.g. OLD PARTNERSHIP NAME" />
            </div>
          </div>
          
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:12}}>
            <label className="field-label" style={{marginTop:0}}>Amend Trade Name(s)?</label>
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:'.85rem',cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={s.amendTradeNames} onChange={e => handleAmendTradeToggle(e.target.checked)} style={{width:'auto',margin:0}} />
              <span style={{color:'var(--gold)',fontWeight:700}}>Yes — amend trade names</span>
            </label>
            {s.amendTradeNames && (
              <div>
                {s.newTradeNames.map((name, i) => (
                  <div key={i} className="trade-name-tag">
                    <span>{name}</span>
                    <button onClick={() => s.removeNewTradeName(i)}>✕</button>
                  </div>
                ))}
                <div className="trade-name-add-row">
                  <input type="text" value={tradeInput} onChange={e => setTradeInput(e.target.value)} placeholder="e.g. NEW TRADE NAME" onKeyDown={e => { if(e.key==='Enter'){s.addNewTradeName(tradeInput);setTradeInput('');e.preventDefault();}}} />
                  <button className="btn btn-sm btn-gold" onClick={() => {s.addNewTradeName(tradeInput);setTradeInput('');}}>+ Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isArt('2') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article II — Primary & Secondary Purpose</h3>
          
          <div style={{marginBottom: 16}}>
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:'.85rem',cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={s.amendPrimary} onChange={e => s.setAmendPrimary(e.target.checked)} style={{width:'auto',margin:0}} />
              <span style={{color:'var(--gold)',fontWeight:700}}>Amend Primary Purpose?</span>
            </label>
            {s.amendPrimary && (
              <div style={{paddingLeft: 24, borderLeft: '2px solid var(--border)', marginBottom: 20}}>
                <div className="input-grid" style={{marginBottom: 16}}>
                  <div className="full">
                    <label className="field-label">NEW PRIMARY PURPOSE — PRIOR AMENDMENT DATE (IF PREVIOUSLY AMENDED)</label>
                    <input type="date" value={s.newArt2PrimaryAmdDate} onChange={e => s.setNewArt2PrimaryAmdDate(e.target.value)} />
                  </div>
                </div>

                <label className="field-label">New Primary Purpose</label>
                <input type="text" className="purpose-search" placeholder="Search primary purpose..." value={purposeQueryPrimary} onChange={e => setPurposeQueryPrimary(e.target.value)} />
                <div className="purpose-list">
                  {filterPurposes(purposeQueryPrimary).slice(0, 50).map(p => (
                    <div key={p.name} className={`purpose-item${s.selectedPrimary?.name===p.name?' selected':''}`} onClick={() => selectPrimary(p)}>
                      <div className="p-name">{p.name}</div>
                      <div className="p-text">{p.text}</div>
                    </div>
                  ))}
                </div>
                {s.selectedPrimary && (
                  <div className="sel-purpose-tag" style={{marginTop:10}}>
                    <span><b>{s.selectedPrimary.name}:</b> {s.selectedPrimary.text}</span>
                    <button onClick={() => s.setSelectedPrimary(null)}>✕</button>
                  </div>
                )}
                <label className="field-label" style={{marginTop:16}}>Custom Primary Purpose:</label>
                <textarea value={s.customPurpose} onChange={e => s.setCustomPurpose(e.target.value)} rows={3} placeholder="Type full custom primary purpose..." />
              </div>
            )}

            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:'.85rem',cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={s.amendSecondary} onChange={e => s.setAmendSecondary(e.target.checked)} style={{width:'auto',margin:0}} />
              <span style={{color:'var(--gold)',fontWeight:700}}>Amend Secondary Purpose(s)?</span>
            </label>
            {s.amendSecondary && (
              <div style={{paddingLeft: 24, borderLeft: '2px solid var(--border)'}}>
                <div className="input-grid" style={{marginBottom: 16}}>
                  <div className="full">
                    <label className="field-label">NEW SECONDARY PURPOSE(S) — PRIOR AMENDMENT DATE (IF PREVIOUSLY AMENDED)</label>
                    <input type="date" value={s.newArt2SecondaryAmdDate} onChange={e => s.setNewArt2SecondaryAmdDate(e.target.value)} />
                  </div>
                </div>

                <label className="field-label">New Secondary Purpose(s)</label>
                <input type="text" className="purpose-search" placeholder="Search secondary..." value={purposeQuerySecondary} onChange={e => setPurposeQuerySecondary(e.target.value)} />
                <div className="selected-purposes">
                  {s.selectedSecondary.map((p, i) => (
                    <div key={p.name} className="sel-purpose-tag">
                      <span><b>{p.name}:</b> {p.text}</span>
                      <button onClick={() => s.setSelectedSecondary(prev => prev.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="purpose-list">
                  {filterPurposes(purposeQuerySecondary).slice(0, 50).map(p => (
                    <div key={p.name} className={`purpose-item${s.selectedSecondary.some(x=>x.name===p.name)?' selected':''}`} onClick={() => selectSecondary(p)}>
                      <div className="p-name">{p.name}</div>
                      <div className="p-text">{p.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isArt('3') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article III — Principal Office</h3>
          <p style={{fontSize:'.78rem',color:'#8b949e',margin:'0 0 8px 0'}}>Only fill No./Street if the document explicitly states a street address with a number or street type keyword. Leave blank if the document only lists barangay/city.</p>
          <div className="input-grid">
            <div className="full">
              <label className="field-label">NO. / STREET (LEAVE BLANK IF NOT EXPLICITLY IN DOCUMENT)</label>
              <input type="text" value={s.newStreet} onChange={e => s.setNewStreet(e.target.value)} placeholder="e.g. 293 General Ordonez Street — leave blank if not stated" />
            </div>
            <div><label className="field-label">BARANGAY / DISTRICT</label><input type="text" value={s.newBrgy} onChange={e => s.setNewBrgy(e.target.value)} /></div>
            <div><label className="field-label">CITY / MUNICIPALITY</label><input type="text" value={s.newCity} onChange={e => s.setNewCity(e.target.value)} /></div>
            <div><label className="field-label">PROVINCE / REGION</label><input type="text" value={s.newProv} onChange={e => s.setNewProv(e.target.value)} /></div>
            <div><label className="field-label">ZIP CODE (OPTIONAL)</label><input type="text" value={s.newZip} onChange={e => s.setNewZip(e.target.value)} /></div>
            <div className="full">
              <label className="field-label">ARTICLE III — PRIOR AMENDMENT DATE</label>
              <input type="date" value={s.newArt3AmdDate} onChange={e => s.setNewArt3AmdDate(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {isArt('4') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article IV — Partnership Term</h3>
          <div className="input-grid">
            <div>
              <label className="field-label">TERM (YEARS — ENTER 0 FOR PERPETUAL)</label>
              <input type="number" value={s.newTerm} onChange={e => s.setNewTerm(e.target.value)} min={0} />
            </div>
            <div className="full">
              <label className="field-label">ARTICLE IV — PRIOR AMENDMENT DATE</label>
              <input type="date" value={s.newArt4AmdDate} onChange={e => s.setNewArt4AmdDate(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {isArt('5') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article V — Partners</h3>
          <TableEditor cols={NEW_PARTNER_COLS} rows={s.newPartners}
            onAdd={() => s.addRow(s.setNewPartners, NEW_PARTNER_COLS)}
            onRemove={i => s.removeRow(s.setNewPartners, i)}
            onUpdate={(i,c,v) => s.updateRow(s.setNewPartners, i, c, v)}
          />
        </div>
      )}

      {isArt('6') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article VI — Partnership Capital</h3>
          <div className="input-grid">
            <div className="full"><label className="field-label">Total Capital (Words)</label><input type="text" value={s.newAmountWords} onChange={e => s.setNewAmountWords(e.target.value)} /></div>
            <div className="full">
              <label className="field-label">Total Amount (₱)</label>
              <input 
                type="text" 
                value={s.newAmountNum} 
                onChange={e => s.setNewAmountNum(e.target.value)} 
                onBlur={e => {
                  const numeric = parseFloat(e.target.value.replace(/,/g, ''));
                  if (!isNaN(numeric)) {
                    s.setNewAmountNum(numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                  }
                }}
              />
            </div>
          </div>
          <label className="field-label" style={{marginTop:14}}>New Contribution Roster</label>
          <TableEditor cols={NEW_CONTRIB_COLS} rows={s.newContributions}
            onAdd={() => s.addRow(s.setNewContributions, NEW_CONTRIB_COLS)}
            onRemove={i => s.removeRow(s.setNewContributions, i)}
            onUpdate={(i,c,v) => s.updateRow(s.setNewContributions, i, c, v)}
          />
        </div>
      )}

      {isArt('8') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article VIII — Management</h3>
          <label className="field-label">New General Manager</label>
          <input type="text" value={s.newGeneralManager} onChange={e => s.setNewGeneralManager(e.target.value)} />
        </div>
      )}

      <div className="form-block card">
        <h3 style={{color:'var(--gold)'}}>Document Signatories</h3>
        <p style={{fontSize:'.78rem',color:'#8b949e',margin:'0 0 12px 0'}}>Review and edit the names and TINs of the partners who will sign the Amended Articles of Partnership.</p>
        <TableEditor cols={SIGNATORY_COLS} rows={s.newSignatories}
          onAdd={() => s.addRow(s.setNewSignatories, SIGNATORY_COLS)}
          onRemove={i => s.removeRow(s.setNewSignatories, i)}
          onUpdate={(i,c,v) => s.updateRow(s.setNewSignatories, i, c, v)}
        />
      </div>

      <div style={{marginTop:20}}>
        <button className="btn" onClick={doGenerate}>⚖ Generate Legal Documents →</button>
      </div>
    </div>
  );
}
