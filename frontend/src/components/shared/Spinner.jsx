export default function Spinner({ fullScreen }) {
  if (fullScreen) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:40, height:40, borderWidth:3 }} />
    </div>
  );
  return <span className="spinner" />;
}
