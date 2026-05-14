/**
 * ImageUploader — drag & drop + preview + remove
 * Props:
 *   files: File[]
 *   onChange: (files: File[]) => void
 *   maxFiles: number (default 5)
 *   maxMB: number (default 2)
 */
import { useRef, useState } from 'react';

const MB = 1024 * 1024;

export default function ImageUploader({ files = [], onChange, maxFiles = 5, maxMB = 2 }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error,    setError]    = useState('');

  const addFiles = (newFiles) => {
    setError('');
    const valid = [];
    for (const f of newFiles) {
      if (!f.type.startsWith('image/')) { setError('Only image files allowed.'); continue; }
      if (f.size > maxMB * MB) { setError(`Max file size is ${maxMB}MB.`); continue; }
      valid.push(f);
    }
    const merged = [...files, ...valid].slice(0, maxFiles);
    onChange(merged);
    if (files.length + valid.length > maxFiles) setError(`Max ${maxFiles} images allowed.`);
  };

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    onChange(updated);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles([...e.dataTransfer.files]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--primary-light)' : 'var(--border-dark)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--primary-bg)' : 'var(--bg-muted)',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>📷</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Click to upload or drag & drop images
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          JPG, PNG, WEBP · Max {maxMB}MB each · Up to {maxFiles} files
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={e => { addFiles([...e.target.files]); e.target.value = ''; }}
        />
      </div>

      {/* Error */}
      {error && <p className="form-error">{error}</p>}

      {/* Previews */}
      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
          {files.map((file, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1', background: 'var(--bg-muted)' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${i}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
              >✕</button>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.6rem', padding: '2px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {files.length}/{maxFiles} image{files.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
