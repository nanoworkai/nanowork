import ReactDOM from 'react-dom/client'

const root = document.getElementById('root')
if (!root) throw new Error('root not found')

ReactDOM.createRoot(root).render(
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '48px',
    fontFamily: 'system-ui'
  }}>
    Nanowork
  </div>
)
