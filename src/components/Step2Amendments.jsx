import React, { useState } from "react";
import TableEditor from "./shared/TableEditor";
import { NEW_INCORP_COLS, NEW_DIR_COLS, NEW_SUBS_COLS, SIGNATORY_COLS } from "../hooks/useAppState";
import { PURPOSE_DB } from "../utils/purposeDb";
import { generateDocumentHTML } from "../utils/docGenerator";

const ARTICLES = [
  { id: '1',  label: 'Art. I — Name' },
  { id: '2',  label: 'Art. II — Purpose' },
  { id: '3',  label: 'Art. III — Office' },
  { id: '4',  label: 'Art. IV — Term' },
  { id: '5',  label: 'Art. V — Incorporators' },
  { id: '6',  label: 'Art. VI — Directors' },
  { id: '7',  label: 'Art. VII — Capital' },
  { id: '89', label: 'Art. VIII/IX — Subscriptions' },
  { id: '10', label: 'Art. X — Treasurer' },
  { id: '11', label: 'Art. XI — Amendment Clause' },
];

export default function Step2Amendments({ s, setActiveTab, setGeneratedHTML }) {
  const [tradeInput, setTradeInput] = useState('');
  const [formerlyTradeInput, setFormerlyTradeInput] = useState('');
  const [purposeQueryPrimary, setPurposeQueryPrimary] = useState('');
  const [purposeQuerySecondary, setPurposeQuerySecondary] = useState('');

  function toggleArt(id) {
    s.setSelectedArts(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // When opening Art I, reset trade name toggle
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
    s.setSelectedPrimary(prev => prev?.name === p.name ? null : p);
  }

  function selectSecondary(p) {
    s.setSelectedSecondary(prev =>
      prev.some(x => x.name === p.name)
        ? prev.filter(x => x.name !== p.name)
        : [...prev, p]
    );
  }

  function doGenerate() {
    const html = generateDocumentHTML(s);
    setGeneratedHTML(html);
    setActiveTab('preview');
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <h2>Step 2 — Select &amp; Configure Amendments</h2>
      </div>

      {/* Meeting details */}
      <div className="card">
        <h3>Meeting Details</h3>
        <div className="input-grid">
          <div>
            <label className="field-label">Date of Board/Stockholder Meeting</label>
            <input type="date" value={s.meetingDate} onChange={e => s.setMeetingDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Place of Meeting</label>
            <input type="text" value={s.meetingPlace} onChange={e => s.setMeetingPlace(e.target.value)} placeholder="Full address of meeting venue" />
          </div>
        </div>
      </div>

      {/* Article selector chips */}
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

      {/* Art I */}
      {isArt('1') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article I — Corporate Name</h3>
          <p style={{fontSize:'.8rem',color:'#8b949e',margin:'0 0 8px 0'}}>CURRENT REGISTERED NAME: <b>{s.baseName || '—'}</b></p>
          
          <div className="input-grid">
            <div className="full">
              <label className="field-label">NEW CORPORATE NAME (ALL CAPS)</label>
              <input type="text" value={s.newName} onChange={e => s.setNewName(e.target.value.toUpperCase())} placeholder="e.g. RIZAL POULTRY INTEGRATED FOOD CORPORATION" />
            </div>
            <div>
              <label className="field-label">ARTICLE I — PRIOR AMENDMENT DATE (IF PREVIOUSLY AMENDED)</label>
              <input type="date" value={s.newArt1AmdDate} onChange={e => s.setNewArt1AmdDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">FORMER NAME (IF CURRENT NAME WAS PREVIOUSLY CHANGED — LEAVE BLANK IF ORIGINAL NAME)</label>
              <input type="text" value={s.newFormerly} onChange={e => s.setNewFormerly(e.target.value.toUpperCase())} placeholder="e.g. OLD CORPORATE NAME" />
            </div>
            <div className="full">
              <label className="field-label">FORMER TRADE NAME(S) (ASSOCIATED WITH THE FORMER NAME ABOVE)</label>
              {s.newFormerlyTradeNames.length === 0
                ? <p style={{fontSize:'.78rem',color:'#555',margin:'4px 0'}}>No former trade names added.</p>
                : s.newFormerlyTradeNames.map((name, i) => (
                  <div key={i} className="trade-name-tag">
                    <span>{name}</span>
                    <button onClick={() => s.removeNewFormerlyTradeName(i)}>✕</button>
                  </div>
                ))
              }
              <div className="trade-name-add-row">
                <input type="text" value={formerlyTradeInput} onChange={e => setFormerlyTradeInput(e.target.value)}
                  placeholder="e.g. OLD TRADE NAME"
                  onKeyDown={e => { if(e.key==='Enter'){s.addNewFormerlyTradeName(formerlyTradeInput);setFormerlyTradeInput('');e.preventDefault();}}}
                />
                <button className="btn btn-sm btn-gold" onClick={() => {s.addNewFormerlyTradeName(formerlyTradeInput);setFormerlyTradeInput('');}}>+ Add</button>
              </div>
            </div>
          </div>
          
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:12}}>
            <label className="field-label" style={{marginTop:0}}>Also Amend Trade Name(s)?</label>
            <p style={{fontSize:'.78rem',color:'#8b949e',margin:'4px 0 10px 0'}}>
              Toggle whether to amend trade names as part of this Article I amendment.
            </p>
            <label style={{display:'flex',alignItems:'center',gap:10,fontSize:'.85rem',cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={s.amendTradeNames} onChange={e => handleAmendTradeToggle(e.target.checked)} style={{width:'auto',margin:0}} />
              <span style={{color:'var(--gold)',fontWeight:700}}>Yes — amend trade names as part of this Article I amendment</span>
            </label>
            {s.amendTradeNames && (
              <div>
                <p style={{fontSize:'.78rem',color:'#8b949e',margin:'0 0 8px 0'}}>Edit the list below. Remove all to have no trade names.</p>
                {s.newTradeNames.length === 0
                  ? <p style={{fontSize:'.78rem',color:'#555',margin:'4px 0'}}>No trade names — all will be removed if saved.</p>
                  : s.newTradeNames.map((name, i) => (
                    <div key={i} className="trade-name-tag">
                      <span>{name}</span>
                      <button onClick={() => s.removeNewTradeName(i)}>✕</button>
                    </div>
                  ))
                }
                <div className="trade-name-add-row">
                  <input type="text" value={tradeInput} onChange={e => setTradeInput(e.target.value)}
                    placeholder="e.g. RIZAL INTEGRATED FARMS"
                    onKeyDown={e => { if(e.key==='Enter'){s.addNewTradeName(tradeInput);setTradeInput('');e.preventDefault();}}}
                  />
                  <button className="btn btn-sm btn-gold" onClick={() => {s.addNewTradeName(tradeInput);setTradeInput('');}}>+ Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Art II */}
      {isArt('2') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article II — Change of Purpose</h3>
          
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
                  {filterPurposes(purposeQueryPrimary).map(p => (
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
                <label className="field-label" style={{marginTop:16}}>Or type a custom primary purpose:</label>
                <textarea value={s.customPurpose} onChange={e => s.setCustomPurpose(e.target.value)} placeholder="Type full custom primary purpose text here..." rows={3} />
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
                <input type="text" className="purpose-search" placeholder="Search secondary purposes..." value={purposeQuerySecondary} onChange={e => setPurposeQuerySecondary(e.target.value)} />
                <div className="purpose-list">
                  {filterPurposes(purposeQuerySecondary).map(p => (
                    <div key={p.name} className={`purpose-item${s.selectedSecondary.some(x=>x.name===p.name)?' selected':''}`} onClick={() => selectSecondary(p)}>
                      <div className="p-name">{p.name}</div>
                      <div className="p-text">{p.text}</div>
                    </div>
                  ))}
                </div>
                <div className="selected-purposes">
                  {s.selectedSecondary.map((p, i) => (
                    <div key={p.name} className="sel-purpose-tag">
                      <span><b>{p.name}:</b> {p.text}</span>
                      <button onClick={() => s.setSelectedSecondary(prev => prev.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Art III */}
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

      {/* Art IV */}
      {isArt('4') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article IV — Corporate Term</h3>
          <div className="input-grid">
            <div>
              <label className="field-label">TERM (YEARS — ENTER 0 FOR PERPETUAL)</label>
              <input type="number" value={s.newTerm} onChange={e => s.setNewTerm(e.target.value)} placeholder="e.g. 50 or 0 for perpetual" min={0} max={50} />
            </div>
            <div className="full">
              <label className="field-label">ARTICLE IV — PRIOR AMENDMENT DATE</label>
              <input type="date" value={s.newArt4AmdDate} onChange={e => s.setNewArt4AmdDate(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Art V */}
      {isArt('5') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article V — Change of Incorporators</h3>
          <TableEditor cols={NEW_INCORP_COLS} rows={s.newIncorp}
            onAdd={() => s.addRow(s.setNewIncorp, NEW_INCORP_COLS)}
            onRemove={i => s.removeRow(s.setNewIncorp, i)}
            onUpdate={(i,c,v) => s.updateRow(s.setNewIncorp, i, c, v)}
          />
        </div>
      )}

      {/* Art VI */}
      {isArt('6') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article VI — Change in Board of Directors</h3>
          <div className="input-grid">
            <div>
              <label className="field-label">New Number of Directors</label>
              <input type="number" value={s.newDirCount} onChange={e => s.setNewDirCount(e.target.value)} placeholder="e.g. 7" min={1} max={15} />
            </div>
          </div>
          <label className="field-label" style={{marginTop:14}}>New Director Roster</label>
          <TableEditor cols={NEW_DIR_COLS} rows={s.newDirs}
            onAdd={() => s.addRow(s.setNewDirs, NEW_DIR_COLS)}
            onRemove={i => s.removeRow(s.setNewDirs, i)}
            onUpdate={(i,c,v) => s.updateRow(s.setNewDirs, i, c, v)}
          />
        </div>
      )}

      {/* Art VII */}
      {isArt('7') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article VII — Change of Authorized Capital Stock</h3>
          <div className="input-grid">
            <div className="full">
              <label className="field-label">New ACS (in words, ALL CAPS)</label>
              <input type="text" value={s.newAcsWords} onChange={e => s.setNewAcsWords(e.target.value)} />
            </div>
            <div><label className="field-label">Amount (₱)</label><input type="text" value={s.newAcsAmt} onChange={e => s.setNewAcsAmt(e.target.value)} /></div>
            <div><label className="field-label">No. of Shares</label><input type="text" value={s.newShares} onChange={e => s.setNewShares(e.target.value)} /></div>
            <div><label className="field-label">Par Value per Share (₱)</label><input type="text" value={s.newPar} onChange={e => s.setNewPar(e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* Art VIII/IX */}
      {isArt('89') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Articles VIII &amp; IX — Subscription &amp; Payment</h3>
          <TableEditor cols={NEW_SUBS_COLS} rows={s.newSubs}
            onAdd={() => s.addRow(s.setNewSubs, NEW_SUBS_COLS)}
            onRemove={i => s.removeRow(s.setNewSubs, i)}
            onUpdate={(i,c,v) => s.updateRow(s.setNewSubs, i, c, v)}
          />
        </div>
      )}

      {/* Art X */}
      {isArt('10') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article X — Change of Treasurer-in-Trust</h3>
          <div className="input-grid">
            <div>
              <label className="field-label">New Treasurer Name</label>
              <input type="text" value={s.newTreasurer} onChange={e => s.setNewTreasurer(e.target.value)} />
            </div>
            <div>
              <label className="field-label">New Treasurer TIN</label>
              <input type="text" value={s.newTreasurerTin} onChange={e => s.setNewTreasurerTin(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Art XI */}
      {isArt('11') && (
        <div className="form-block card">
          <h3 style={{color:'var(--gold)'}}>Article XI — Amendment Clause</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
            <label style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:'.83rem',cursor:'pointer'}}>
              <input type="radio" name="comp-clause" value="standard" checked={s.compClause==='standard'} onChange={() => s.setCompClause('standard')} style={{width:'auto',marginTop:3}} />
              <span><b>Standard:</b> That the corporation manifests its willingness to change its corporate name in the event another person, firm, or entity has acquired a prior right to use the said firm name or one deceptively or confusingly similar to it.</span>
            </label>
            <label style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:'.83rem',cursor:'pointer'}}>
              <input type="radio" name="comp-clause" value="custom" checked={s.compClause==='custom'} onChange={() => s.setCompClause('custom')} style={{width:'auto',marginTop:3}} />
              <span><b>Custom provision:</b></span>
            </label>
          </div>
          <textarea value={s.customCompClause} onChange={e => s.setCustomCompClause(e.target.value)} placeholder="Enter custom provision text here..." rows={3} style={{marginTop:8}} />
        </div>
      )}

      <div className="form-block card">
        <h3 style={{color:'var(--gold)'}}>Document Signatories</h3>
        <p style={{fontSize:'.78rem',color:'#8b949e',margin:'0 0 12px 0'}}>Review and edit the names, roles, and TINs of the individuals who will sign the Amended Articles of Incorporation and Treasurer's Affidavit.</p>
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
