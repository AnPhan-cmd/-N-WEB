import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile'; // File thông tin cá nhân của ông

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // BƯỚC QUAN TRỌNG: Load user từ LocalStorage khi khởi động app
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    if (loading) return null; // Tránh flash giao diện khi đang load user

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 
                    Lớp bảo vệ: Nếu có user thì cho vào Profile, 
                    nếu không có (null) thì đá về Login 
                */}
                <Route 
                    path="/profile" 
                    element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
                />
            </Routes>
        </Router>
    );
}

export default App;