import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export default function CustomFieldBuilder() {
  const [fields, setFields] = useState<any[]>([]);
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [optionInput, setOptionInput] = useState('');
  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    fetch(`${API}/api/custom-fields`, {
      headers: { Authorization: `Bearer ${jwt}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFields(data);
        else setFields([]);
      });
  }, [jwt]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!label) return;
    if ((type === 'radio' || type === 'dropdown') && options.length === 0) return;
    const res = await fetch(`${API}/api/custom-fields`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ label, type, required, options: (type === 'radio' || type === 'dropdown') ? options : undefined })
    });
    if (res.ok) {
      const field = await res.json();
      setFields([field, ...fields]);
      setLabel('');
      setType('text');
      setRequired(false);
      setOptions([]);
      setOptionInput('');
    } else {
      const err = await res.json();
      alert(err.error || 'Error adding field');
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`${API}/api/custom-fields/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` }
    });
    if (res.ok) {
      setFields(fields.filter(f => f.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Error deleting field');
    }
  }

  function handleAddOption(e: React.FormEvent) {
    e.preventDefault();
    if (!optionInput) return;
    setOptions([...options, { label: optionInput, value: optionInput }]);
    setOptionInput('');
  }
  function handleRemoveOption(idx: number) {
    setOptions(options.filter((_, i) => i !== idx));
  }

  // Editing fields is left as an exercise; you can add a similar handleEdit/handleEditSave as in UserManager

  const safeFields = Array.isArray(fields) ? fields : [];

  return (
    <div className="bg-white/90 rounded-xl shadow p-6 w-full max-w-lg mb-6">
      <h3 className="text-lg font-semibold text-ashram-primary mb-2">Custom Field Builder (Admin)</h3>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <input className="input" placeholder="Field Label" value={label} onChange={e => setLabel(e.target.value)} required />
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="checkbox">Checkbox</option>
          <option value="radio">Radio</option>
          <option value="dropdown">Dropdown</option>
        </select>
        <label className="flex items-center gap-2 text-ashram-primary">
          <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} /> Required
        </label>
        {(type === 'radio' || type === 'dropdown') && (
          <div>
            <div className="flex gap-2 mb-1">
              <input className="input flex-1" placeholder="Option label" value={optionInput} onChange={e => setOptionInput(e.target.value)} />
              <button type="button" className="bg-ashram-accent text-white px-2 rounded" onClick={handleAddOption}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((opt, i) => (
                <span key={i} className="bg-ashram-pink px-2 py-1 rounded text-xs flex items-center gap-1">
                  {opt.label}
                  <button type="button" className="text-red-500" onClick={() => handleRemoveOption(i)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className="bg-ashram-primary text-white px-4 py-2 rounded hover:bg-ashram-accent transition">Add Field</button>
      </form>
      <div>
        {safeFields.length === 0 && <div className="text-ashram-accent">No custom fields yet.</div>}
        {safeFields.map(f => (
          <div key={f.id} className="flex items-center gap-2 mb-2">
            <span className="font-medium text-ashram-primary mr-2">{f.label} ({f.type}){f.required ? '*' : ''}</span>
            {f.options && f.options.map((opt: any, i: number) => (
              <span key={i} className="bg-ashram-light px-2 py-1 rounded text-xs">{opt.label}</span>
            ))}
            <button className="ml-2 text-xs text-red-500 underline" onClick={() => handleDelete(f.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
} 