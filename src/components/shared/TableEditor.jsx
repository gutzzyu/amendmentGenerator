import React from "react";

// cols = array of column name strings
// rows = array of objects keyed by col name
// onAdd, onRemove(idx), onUpdate(idx, col, val)
export default function TableEditor({ cols, rows, onAdd, onRemove, onUpdate, addLabel = '+ Add Row' }) {
  const isAmountCol = (c) => c.toLowerCase().includes('amount') || c.toLowerCase().includes('capital');
  
  const handleBlur = (i, c, val) => {
    if (isAmountCol(c)) {
      // Clean and format with commas
      const numeric = parseFloat(val.replace(/,/g, ''));
      if (!isNaN(numeric)) {
        onUpdate(i, c, numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    }
  };

  const calculateTotal = () => {
    const amountCol = cols.find(isAmountCol);
    if (!amountCol) return null;
    const total = rows.reduce((acc, row) => {
      const val = parseFloat((row[amountCol] || '').toString().replace(/,/g, '')) || 0;
      return acc + val;
    }, 0);
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalVal = calculateTotal();
  const amountColIndex = cols.findIndex(isAmountCol);

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            {cols.map(c => <th key={c}>{c}</th>)}
            <th style={{width: 40}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => (
                <td key={c}>
                  <input
                    type="text"
                    placeholder={c}
                    className={isAmountCol(c) ? 'text-right' : ''}
                    value={row[c] || ''}
                    onChange={e => onUpdate(i, c, e.target.value)}
                    onBlur={e => handleBlur(i, c, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => onRemove(i)}>✕</button>
              </td>
            </tr>
          ))}
          {totalVal !== null && rows.length > 0 && (
            <tr style={{background: '#0d1117', fontWeight: 'bold'}}>
              {cols.map((c, idx) => (
                <td key={`total-${idx}`} style={{textAlign: idx === amountColIndex ? 'right' : 'left', padding: '8px 12px'}}>
                  {idx === amountColIndex - 1 ? 'TOTAL' : idx === amountColIndex ? `₱${totalVal}` : ''}
                </td>
              ))}
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-actions">
        <button className="btn btn-sm" onClick={onAdd}>{addLabel}</button>
      </div>
    </div>
  );
}
