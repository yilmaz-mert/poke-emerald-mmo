import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthScreen() {
  const { login, register, isLoading, error } = useAuthStore();
  const [started, setStarted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', avatar: 'brendan' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) await login(formData.username, formData.password);
    else await register(formData.username, formData.password, formData.avatar);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden font-pixel flex items-center justify-center">
      {/* Pokedex Teknolojik Arka Plan Efekti */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(rgba(255, 0, 0, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 0, 0.2) 1px, transparent 1px)',
             backgroundSize: '30px 30px'
           }}>
      </div>

      <div className="relative z-10 w-full max-w-md p-4 transition-all duration-700">
        {!started ? (
          <div className="text-center cursor-pointer animate-pulse" onClick={() => setStarted(true)}>
            <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-6 border-8 border-gray-800 shadow-[0_0_20px_rgba(220,38,38,0.8)] flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-400 rounded-full border-4 border-gray-900 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-widest mb-4">
              POKéDEX <span className="text-red-500">OS</span>
            </h1>
            <p className="text-lg text-gray-400 drop-shadow-md">INITIALIZE SYSTEM</p>
          </div>
        ) : (
          <div className="bg-gray-800 border-4 border-red-600 rounded-lg p-6 shadow-[8px_8px_0_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Üst Kırmızı Şerit */}
            <div className="absolute top-0 left-0 w-full h-6 bg-red-600 flex items-center px-2 gap-2">
              <div className="w-3 h-3 bg-red-900 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>

            <h2 className="text-2xl text-white mb-6 mt-4 text-center border-b-2 border-gray-600 pb-2">
              {isLogin ? 'USER LOGIN' : 'NEW REGISTRATION'}
            </h2>

            {error && <div className="mb-4 p-2 bg-red-900/50 border border-red-500 text-red-200 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1 tracking-wider">TRAINER ID / NAME:</label>
                <input 
                  type="text" name="username" required maxLength="12" value={formData.username} onChange={handleChange}
                  className="w-full bg-gray-900 border-2 border-gray-600 outline-none p-2 uppercase text-white focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1 tracking-wider">PASSWORD:</label>
                <input 
                  type="password" name="password" required value={formData.password} onChange={handleChange}
                  className="w-full bg-gray-900 border-2 border-gray-600 outline-none p-2 text-white focus:border-red-500 transition-colors"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-gray-400 text-xs mb-2 tracking-wider">SELECT AVATAR MODEL:</label>
                  <div className="flex justify-around bg-gray-900 p-2 border-2 border-gray-600">
                    <label className={`cursor-pointer p-2 border-2 ${formData.avatar === 'brendan' ? 'border-red-500 bg-gray-800' : 'border-transparent'}`}>
                      <input type="radio" name="avatar" value="brendan" className="hidden" onChange={handleChange} />
                      <div className="text-white text-xs text-center">BRENDAN</div>
                    </label>
                    <label className={`cursor-pointer p-2 border-2 ${formData.avatar === 'may' ? 'border-red-500 bg-gray-800' : 'border-transparent'}`}>
                      <input type="radio" name="avatar" value="may" className="hidden" onChange={handleChange} />
                      <div className="text-white text-xs text-center">MAY</div>
                    </label>
                  </div>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="mt-4 bg-red-600 hover:bg-red-500 text-white border-2 border-red-800 p-3 font-bold tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none">
                {isLoading ? 'PROCESSING...' : isLogin ? 'AUTHENTICATE' : 'REGISTER'}
              </button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)} type="button" className="w-full mt-4 text-gray-400 hover:text-white text-xs underline text-center">
              {isLogin ? "Create new Trainer ID" : "Already have an ID? Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}