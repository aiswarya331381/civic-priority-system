import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotifContext = createContext(null);
export const useNotif = () => useContext(NotifContext);

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([]);
  const ref = useRef(0);

  const addNotif = useCallback((type, title, msg) => {
    const id = ++ref.current;
    setNotifs(n => [...n, { id, type, title, msg }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 4500);
  }, []);

  const removeNotif = (id) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <NotifContext.Provider value={{ addNotif }}>
      {children}
      <NotifContainer notifs={notifs} onClose={removeNotif} />
    </NotifContext.Provider>
  );
}

function NotifContainer({ notifs, onClose }) {
  if (!notifs.length) return null;
  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {notifs.map(n => (
        <div key={n.id} className={`notif notif-${n.type}`}>
          <span className="notif-icon">{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}</span>
          <div className="notif-body">
            <div className="notif-title">{n.title}</div>
            {n.msg && <div className="notif-msg">{n.msg}</div>}
          </div>
          <button onClick={() => onClose(n.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
