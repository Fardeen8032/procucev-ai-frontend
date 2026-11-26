import { useEffect, useState } from 'react';
import { transcriptionsApi } from '../api/client.js';

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await transcriptionsApi.list();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transcription?')) return;
    await transcriptionsApi.remove(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    const updated = await transcriptionsApi.update(id, { text: editText });
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    cancelEdit();
  };

  if (loading) return <p>Loading history…</p>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Transcription History</h2>
        <button className="btn" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <p className="placeholder">No transcriptions yet. Record one on the Live Transcribe page.</p>
      ) : (
        <table className="transcription-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Text</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td className="text-cell">
                  {editingId === item.id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
                  ) : (
                    item.text
                  )}
                </td>
                <td>{item.durationMs ? `${Math.round(item.durationMs / 1000)}s` : '—'}</td>
                <td>{item.status}</td>
                <td className="actions-cell">
                  {editingId === item.id ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item.id)}>
                        Save
                      </button>
                      <button className="btn btn-sm" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
