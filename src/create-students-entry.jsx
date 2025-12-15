import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createStudents } from '@/scripts/createStudents';
import '@/index.css'; // Optional: Use global styles if available

function CreateStudentsTool() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    // Override console.log to capture logs
    const addToLog = (message) => {
        setLogs((prev) => [...prev, message]);
    };

    const handleCreate = async () => {
        if (!window.confirm("Are you sure you want to create 100 students?")) return;

        setLoading(true);
        setLogs([]);
        addToLog("🚀 Starting process...");

        // Hook into console to capture script output if possible, 
        // or just rely on the script's behavior. 
        // Since createStudents returns the array of created students, we can log that.

        // NOTE: The original script logs to console. We can't easily capture that unless we modify the script 
        // or monkey-patch console.log. For simplicity, we'll just run it and show result.

        try {
            const students = await createStudents();
            addToLog(`✅ Successfully created ${students.length} students.`);
            addToLog("🎉 DONE!");
        } catch (error) {
            addToLog("❌ Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🛠️ Student Generation Tool</h1>
            <p>Click the button below to generate 100 student accounts (student001 - student100) with password 'Student@123'.</p>

            <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: loading ? '#ccc' : '#ef6c00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Processing...' : '⚡ Generate 100 Students'}
            </button>

            <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px', minHeight: '200px', maxHeight: '500px', overflowY: 'auto' }}>
                <h3>Logs:</h3>
                {logs.map((log, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #e0e0e0', padding: '4px 0' }}>{log}</div>
                ))}
                {logs.length === 0 && <span style={{ color: '#888' }}>Waiting for action... (Check functionality in browser console as well)</span>}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <CreateStudentsTool />
    </React.StrictMode>
);
